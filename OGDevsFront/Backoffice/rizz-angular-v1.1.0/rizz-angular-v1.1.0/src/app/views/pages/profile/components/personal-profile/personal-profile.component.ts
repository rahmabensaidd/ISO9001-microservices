import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ChartOptions } from '@/app/common/apexchart.model';
import { currency } from '@/app/common/constants';
import { environment } from '@environment/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal-profile',
  imports: [NgApexchartsModule],
  templateUrl: './personal-profile.component.html',
  standalone: true,
  styles: [`
    .profile-photo-container {
      display: inline-block;
      width: 136px; /* Taille totale: image 120px + padding 8px + bordure 2px */
      height: 136px; /* Taille totale: image 120px + padding 8px + bordure 2px */
      padding: 8px; /* Espace entre image et bordure */
      background-color: #f8f9fa; /* Fond clair pour le cadre */
      border: 2px solid #007bff; /* Bordure bleue */
      border-radius: 50%; /* Cadre circulaire */
      line-height: 0; /* Supprime l'espace supplémentaire */
      box-sizing: border-box; /* Inclut padding et bordure dans la taille */
    }

    .profile-photo-container img {
      width: 120px; /* Taille fixe pour l'image */
      height: 120px; /* Taille fixe pour l'image */
      border-radius: 50%; /* Image circulaire */
      object-fit: cover; /* Évite la déformation */
      display: block;
    }
  `]
})
export class PersonalProfileComponent implements OnInit {
  currency = currency;

  // User Info from Keycloak
  userName: string = '';
  lastName: string = '';
  userEmail: string = '';
  userRoles: string[] = [];
  userId: string = '';
  profilePhotoUrl: string | null = null;
  defaultProfilePhoto: string = 'assets/images/users/avatar-1.jpg'; // Custom default photo

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // Chart Data
  completionChart: Partial<ChartOptions> = {
    series: [67], // Static value, can be updated dynamically
    chart: {
      height: 170,
      type: 'radialBar',
      offsetY: -10
    },
    colors: ['var(--bs-primary)'],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        track: {
          background: 'rgba(42, 118, 244, .18)'
        },
        dataLabels: {
          name: {
            fontSize: '13px',
            offsetY: 50
          },
          value: {
            offsetY: 5,
            fontSize: '15px',
            formatter: (val) => `${val}%`
          }
        }
      }
    },
    stroke: {
      dashArray: 2
    },
    labels: ['Completion']
  };

  constructor(private keycloakService: KeycloakService, private http: HttpClient) {}

  ngOnInit(): void {
    this.getUserInfo();
  }

  // ✅ Fetch User Info from Keycloak
  async getUserInfo(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (isLoggedIn) {
        const userProfile: KeycloakProfile = await this.keycloakService.loadUserProfile();
        this.userName = userProfile.firstName ?? 'Unknown';
        this.lastName = userProfile.lastName ?? 'Unknown';
        this.userEmail = userProfile.email ?? 'No Email Available';
        this.userId = userProfile.id ?? '';

        this.userRoles = await this.keycloakService.getUserRoles(true);

        if (this.userId) {
          this.fetchProfilePhoto();
        }

        console.log('User Info:', {
          userId: this.userId,
          userName: this.userName,
          lastName: this.lastName,
          userEmail: this.userEmail,
          userRoles: this.userRoles,
        });
      } else {
        console.warn('User is not logged in.');
        Swal.fire({
          icon: 'warning',
          title: 'Non connecté',
          text: 'Veuillez vous connecter pour accéder à votre profil.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error fetching user info from Keycloak:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de récupérer les informations utilisateur. Veuillez réessayer.',
        confirmButtonText: 'OK',
      });
    }
  }

  private fetchProfilePhoto(): void {
    this.keycloakService
      .getToken()
      .then((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        this.http
          .get(`${environment.apiUrl}/users/${this.userId}/profile-photo`, { headers, responseType: 'blob' })
          .subscribe({
            next: (blob) => {
              if (blob && blob.size > 0) {
                this.profilePhotoUrl = URL.createObjectURL(blob);
                console.log('Profile photo fetched successfully (200 OK)');
              } else {
                this.profilePhotoUrl = this.defaultProfilePhoto;
                console.log('No profile photo available, using default (200 OK)');
              }
            },
            error: (error: HttpErrorResponse) => {
              console.warn('No profile photo found or error fetching photo:', error);
              this.profilePhotoUrl = this.defaultProfilePhoto;
            },
          });
      })
      .catch((error) => {
        console.error('Error retrieving Keycloak token:', error);
        this.profilePhotoUrl = this.defaultProfilePhoto;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la récupération du token.',
          confirmButtonText: 'OK',
        });
      });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.match('image/jpeg|image/png')) {
        Swal.fire({
          icon: 'error',
          title: 'Type de fichier invalide',
          text: 'Seuls les fichiers JPEG et PNG sont autorisés.',
          confirmButtonText: 'OK',
        });
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.keycloakService
        .getToken()
        .then((token) => {
          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`,
          });

          this.http
            .post(`${environment.apiUrl}/users/${this.userId}/profile-photo`, formData, { headers, responseType: 'json' })
            .subscribe({
              next: (response: any) => {
                this.fetchProfilePhoto();
                Swal.fire({
                  icon: 'success',
                  title: 'Succès',
                  text: 'Photo de profil enregistrée avec succès !',
                  confirmButtonText: 'OK',
                });
              },
              error: (error: HttpErrorResponse) => {
                console.error('Error uploading profile photo:', {
                  status: error.status,
                  message: error.message,
                  error: error.error,
                });
                let errorMessage = 'Erreur lors de l\'upload de la photo.';
                if (error.status === 401) {
                  errorMessage = 'Vous n\'êtes pas autorisé à uploader une photo. Veuillez vous reconnecter.';
                } else if (error.status === 413) {
                  errorMessage = 'La taille du fichier est trop grande.';
                } else if (error.error && error.error.error) {
                  errorMessage = error.error.error; // Use backend error message if available
                }
                Swal.fire({
                  icon: 'error',
                  title: 'Erreur',
                  text: errorMessage,
                  confirmButtonText: 'OK',
                });
              },
            });
        })
        .catch((error) => {
          console.error('Error retrieving Keycloak token:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de la récupération du token.',
            confirmButtonText: 'OK',
          });
        });
    }
  }
}

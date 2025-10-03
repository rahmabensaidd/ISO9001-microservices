import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PosteService } from '@/app/services/poste.service';
import { KeycloakService } from 'keycloak-angular';
import { Poste, UserRepresentation } from '@/app/core/models/poste.model';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-poste-management',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './poste-management.component.html',
  styleUrls: ['./poste-management.component.css']
})
export class PosteManagementComponent implements OnInit, OnDestroy {
  postes: Poste[] = [];
  users: UserRepresentation[] = [];
  posteForm: FormGroup;
  modifyForm: FormGroup;
  submitted: boolean = false;
  selectedPosteId?: number;
  private usersSubscription: Subscription | null = null;

  constructor(
    private posteService: PosteService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.posteForm = this.fb.group({
      mission: ['', [Validators.required]],
      salaire: [0, [Validators.required, Validators.min(0)]],
      userId: ['']
    });
    this.modifyForm = this.fb.group({
      mission: ['', [Validators.required]],
      salaire: [0, [Validators.required, Validators.min(0)]],
      userId: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadPostes();
    await this.loadUsersFromKeycloak();
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  // Notification methods translated to English
  private showSuccess(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#5156be'
    });
  }

  private showError(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#5156be'
    });
  }

  private showWarningConfirm(message: string, confirmButtonText: string = 'Yes, delete it!'): Promise<boolean> {
    return Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'No, cancel!'
    }).then((result) => {
      return result.isConfirmed;
    });
  }

  async loadPostes(): Promise<void> {
    try {
      const postesObservable = await this.posteService.getAllPostes();
      postesObservable.subscribe({
        next: (data: Poste[]) => {
          this.postes = data;
          console.log('Posts loaded:', JSON.stringify(this.postes, null, 2));
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error loading posts:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error,
            url: error.url,
            headers: error.headers
          });
          this.showError('Error loading posts.');
        }
      });
    } catch (error) {
      console.error('Error initiating loadPostes:', error);
      this.showError('Error initiating posts loading.');
    }
  }

  async loadUsersFromKeycloak(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('User not logged in. Redirecting to login page.');
        this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      const realm = 'test';
      const url = `http://localhost:8080/admin/realms/${realm}/users`;

      this.usersSubscription = this.http.get<any[]>(url, { headers }).subscribe({
        next: (users: any[]) => {
          const transformedUsers: UserRepresentation[] = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email || 'N/A',
            enabled: user.enabled,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            status: user.enabled ? 'Active' : 'Inactive',
            last_active: 'N/A',
            role: 'N/A',
            image: 'assets/images/users/default-avatar.jpg'
          }));
          this.users = transformedUsers;
          console.log('Users loaded from Keycloak:', transformedUsers);
        },
        error: (error) => {
          console.error('Error fetching users from Keycloak:', error);
          this.showError('Error fetching users from Keycloak.');
        }
      });
    } catch (error) {
      console.error('Error obtaining Keycloak token:', error);
      this.showError('Error obtaining Keycloak token.');
    }
  }

  openAddPosteModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.posteForm.reset({ mission: '', salaire: 0, userId: '' });
    this.modalService.open(content);
  }

  openModifyPosteModal(content: TemplateRef<any>, poste: Poste): void {
    this.submitted = false;
    this.selectedPosteId = poste.id;
    this.modifyForm.patchValue({
      mission: poste.mission,
      salaire: poste.salaire,
      userId: poste.userEntity?.id || ''
    });
    this.modalService.open(content);
  }

  async createPoste(): Promise<void> {
    this.submitted = true;
    if (this.posteForm.valid) {
      const newPoste: Poste = this.posteForm.value;
      try {
        const posteObservable = await this.posteService.createPoste(newPoste);
        posteObservable.subscribe({
          next: (poste: Poste) => {
            this.postes.push(poste);
            console.log('Post created:', poste);
            const userId = this.posteForm.get('userId')?.value;
            if (userId) {
              this.assignUserToPoste(poste.id!, userId);
            } else {
              this.loadPostes();
            }
            this.modalService.dismissAll();
            this.submitted = false;
            this.showSuccess('Post created successfully!');
          },
          error: (error) => {
            console.error('Error creating post:', error);
            this.showError('Error creating post.');
          }
        });
      } catch (error) {
        console.error('Error initiating createPoste:', error);
        this.showError('Error initiating post creation.');
      }
    } else {
      this.showError('Please fill all required fields.');
    }
  }

  async modifyPoste(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedPosteId) {
      const updatedPoste: Poste = { id: this.selectedPosteId, ...this.modifyForm.value };
      try {
        const posteObservable = await this.posteService.updatePoste(this.selectedPosteId, updatedPoste);
        posteObservable.subscribe({
          next: (poste: Poste) => {
            console.log('Post updated:', poste);
            const userId = this.modifyForm.get('userId')?.value;
            if (userId) {
              this.assignUserToPoste(poste.id!, userId);
            } else {
              const index = this.postes.findIndex(p => p.id === poste.id);
              if (index !== -1) {
                this.postes[index] = poste;
              }
              this.loadPostes();
            }
            this.modalService.dismissAll();
            this.submitted = false;
            this.showSuccess('Post updated successfully!');
          },
          error: (error) => {
            console.error('Error updating post:', error);
            this.showError('Error updating post.');
          }
        });
      } catch (error) {
        console.error('Error initiating modifyPoste:', error);
        this.showError('Error initiating post update.');
      }
    } else {
      this.showError('Please fill all required fields.');
    }
  }

  async deletePoste(id: number): Promise<void> {
    const confirmed = await this.showWarningConfirm(
      'This action cannot be undone!',
      'Yes, delete it!'
    );
    if (confirmed) {
      try {
        const deleteObservable = await this.posteService.deletePoste(id);
        deleteObservable.subscribe({
          next: () => {
            this.postes = this.postes.filter(p => p.id !== id);
            this.loadPostes();
            this.showSuccess('Post deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting post:', error);
            this.showError('Error deleting post.');
          }
        });
      } catch (error) {
        console.error('Error initiating deletePoste:', error);
        this.showError('Error initiating post deletion.');
      }
    }
  }

  private async assignUserToPoste(posteId: number, userId: string): Promise<void> {
    try {
      const assignObservable = await this.posteService.assignUserToPoste(posteId, userId);
      assignObservable.subscribe({
        next: (updatedPoste: Poste) => {
          console.log('User assigned to post:', updatedPoste);
          this.loadPostes();
          this.showSuccess('User assigned to post successfully!');
        },
        error: (error) => {
          console.error('Error assigning user:', error);
          this.showError('Error assigning user.');
        }
      });
    } catch (error) {
      console.error('Error initiating assignUserToPoste:', error);
      this.showError('Error initiating user assignment.');
    }
  }

  get form() {
    return this.posteForm.controls;
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InterviewService, Interview } from '@/app/services/interview.service';
import { JobOffer } from '@/app/services/job-offre.service';
import { Candidate } from '@/app/core/models/candidate.model';
import { CandidateActivity } from '@/app/core/models/candidate-activity.model';
import { KeycloakService } from 'keycloak-angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SocialAuthService, GoogleLoginProvider, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import { NgxSimplebarModule } from 'ngx-simplebar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    FullCalendarModule,
    GoogleSigninButtonModule,
    NgxSimplebarModule,
  ],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss'],
})
export class InterviewComponent implements OnInit {
  interviews: Interview[] = [];
  newInterview: Interview = { name: '', description: '', interviewDate: '', interviewType: 'EMBAUCHE' };
  jobOffers: JobOffer[] = [];
  candidates: Candidate[] = [];
  selectedJobOfferId: number | null = null;
  selectedCandidateId: number | null = null;
  errorMessage: string | null = null;
  isEditing: boolean = false;
  editingInterviewId: number | null = null;
  isLoadingJobOffers: boolean = false;
  isLoadingCandidates: boolean = false;
  googleAccessToken: string | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'timeGridWeek',
    events: [],
    slotMinTime: '09:00:00',
    slotMaxTime: '17:00:00',
    selectable: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventColor: '#3788d8',
  };
  availableSlots: string[] = [];
  selectedCandidateActivities: CandidateActivity[] = [];
  showTimeline: boolean = false;
  selectedCandidateName: string = '';

  constructor(
    private interviewService: InterviewService,
    private keycloakService: KeycloakService,
    private socialAuthService: SocialAuthService,
    private sweetAlertService: SweetAlertService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        this.errorMessage = 'Veuillez vous connecter pour accéder aux entretiens.';
        this.sweetAlertService.showError(this.errorMessage);
        this.keycloakService.login();
        return;
      }

      this.socialAuthService.authState.subscribe({
        next: (user: SocialUser) => {
          this.onGoogleSignIn(user);
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la connexion Google : ' + err.message;
          this.sweetAlertService.showError(this.errorMessage);
          console.error('Erreur SocialAuthService:', err);
        },
      });

      this.loadInterviews();
      this.loadJobOffers();
      this.loadCalendarEvents();
    } catch (err) {
      this.errorMessage = 'Erreur lors de l’initialisation : ' + (err instanceof Error ? err.message : String(err));
      this.sweetAlertService.showError(this.errorMessage);
      console.error('Erreur dans ngOnInit', err);
    }
  }

  loadInterviews(): void {
    this.interviewService.getAllInterviews().subscribe({
      next: (data) => {
        this.interviews = data;
        this.sweetAlertService.showSuccess('Entretiens chargés avec succès !');
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des entretiens : ' + error.message;
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  loadJobOffers(): void {
    this.isLoadingJobOffers = true;
    this.interviewService.getAllJobOffers().subscribe({
      next: (data) => {
        this.jobOffers = data;
        this.isLoadingJobOffers = false;
        this.sweetAlertService.showSuccess('Offres d’emploi chargées avec succès !');
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des offres : ' + error.message;
        this.sweetAlertService.showError(this.errorMessage);
        this.isLoadingJobOffers = false;
      },
    });
  }

  loadCalendarEvents(): void {
    this.interviewService.getAllInterviews().subscribe({
      next: (interviews) => {
        this.calendarOptions.events = interviews.map((interview) => {
          let startDate = new Date(interview.interviewDate);
          if (interview.interviewDate.length <= 10) {
            startDate = new Date(`${interview.interviewDate}T09:00:00`);
          }
          return {
            title: `${interview.name} - ${interview.candidate?.firstName} ${interview.candidate?.lastName}`,
            start: startDate.toISOString(),
            end: new Date(startDate.getTime() + 60 * 60 * 1000).toISOString(),
          };
        });
        this.loadAvailableSlots();
        this.sweetAlertService.showSuccess('Événements du calendrier chargés avec succès !');
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des événements : ' + error.message;
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  loadAvailableSlots(): void {
    const startDate = new Date().toISOString().split('T')[0];
    this.interviewService.getAvailableSlots(startDate).subscribe({
      next: (slots) => {
        this.interviewService.getAllInterviews().subscribe({
          next: (interviews) => {
            const occupiedSlots = interviews.map((interview) => interview.interviewDate);
            this.availableSlots = slots.filter((slot) => !occupiedSlots.includes(slot));
            this.sweetAlertService.showSuccess('Créneaux disponibles chargés avec succès !');
          },
          error: (error) => {
            this.errorMessage = 'Erreur lors du chargement des entretiens : ' + error.message;
            this.sweetAlertService.showError(this.errorMessage);
          },
        });
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la récupération des créneaux : ' + error.message;
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  handleDateSelect(selectInfo: any): void {
    const selectedDate = selectInfo.startStr;
    if (this.availableSlots.includes(selectedDate)) {
      this.newInterview.interviewDate = selectedDate;
      this.errorMessage = null;
      this.sweetAlertService.showInfo('Créneau sélectionné : ' + selectedDate);
    } else {
      this.errorMessage = 'Ce créneau n’est pas disponible. Veuillez en choisir un autre.';
      this.sweetAlertService.showError(this.errorMessage);
    }
  }

  handleEventClick(info: any): void {
    const eventTitle = info.event.title;
    const startDate = info.event.start;
    const interview = this.interviews.find(
      (i) =>
        i.name === eventTitle.split(' - ')[0] &&
        new Date(i.interviewDate).getTime() === startDate.getTime()
    );

    if (interview) {
      let startDateTime = interview.interviewDate;
      if (startDateTime.length <= 10) {
        startDateTime = `${interview.interviewDate}T09:00:00`;
      }

      const startDateObj = new Date(startDateTime);
      if (isNaN(startDateObj.getTime())) {
        console.error('Date invalide:', startDateTime);
        this.sweetAlertService.showError('Erreur: Date de l’entretien invalide.');
        return;
      }

      const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000);

      const startDisplay = startDateTime.length <= 10
        ? `${interview.interviewDate} à 09:00`
        : startDateTime.replace('T', ' à ').substring(0, 16);
      const endDisplay = endDateObj
        .toISOString()
        .replace('T', ' à ')
        .substring(0, 16);

      Swal.fire({
        html: `
          <div style="text-align: left; font-family: Arial, sans-serif;">
            <h2 style="color: #1a73e8; font-size: 20px; margin-bottom: 10px;">${interview.name}</h2>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-calendar" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>${startDisplay} - ${endDisplay}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-info-circle" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>Description: ${interview.description}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-briefcase" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>Type: ${interview.interviewType}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-user" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>Candidat: ${interview.candidate?.firstName} ${interview.candidate?.lastName}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-suitcase" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>Offre d'emploi: ${interview.jobOffer?.title}</span>
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        customClass: {
          popup: 'swal2-custom-popup',
        },
      });
    } else {
      this.sweetAlertService.showError('Détails de l’entretien non trouvés.');
    }
  }

  onGoogleSignIn(user: SocialUser): void {
    this.socialAuthService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then((accessToken: string) => {
      this.googleAccessToken = accessToken;
      this.sweetAlertService.showSuccess('Connexion à Google Calendar réussie !');

      const testInterview: Interview = {
        name: 'Test Event',
        description: 'Test Description',
        interviewDate: new Date().toISOString(),
        interviewType: 'EMBAUCHE',
      };
      this.interviewService.addToGoogleCalendar(testInterview, this.googleAccessToken).subscribe({
        next: () => {
          this.sweetAlertService.showSuccess('Événement de test ajouté à Google Calendar !');
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors du test Google Calendar : ' + err.message;
          this.sweetAlertService.showError(this.errorMessage);
        },
      });
    }).catch((err) => {
      this.errorMessage = 'Erreur lors de la récupération de l’accessToken : ' + err.message;
      this.sweetAlertService.showError(this.errorMessage);
    });
  }

  onJobOfferChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const id = target.value ? parseInt(target.value, 10) : null;
    this.selectedJobOfferId = id;
    this.selectedCandidateId = null;
    this.candidates = [];
    if (this.selectedJobOfferId) {
      this.isLoadingCandidates = true;
      this.interviewService.getCandidatesByJobOffer(this.selectedJobOfferId).subscribe({
        next: (data) => {
          this.candidates = data;
          this.isLoadingCandidates = false;
          if (this.candidates.length === 0) {
            this.errorMessage = 'Aucun candidat associé à cette offre.';
            this.sweetAlertService.showError(this.errorMessage);
          } else {
            this.errorMessage = null;
            this.sweetAlertService.showSuccess('Candidats chargés avec succès !');
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement des candidats : ' + error.message;
          this.sweetAlertService.showError(this.errorMessage);
          this.candidates = [];
          this.isLoadingCandidates = false;
        },
      });
    } else {
      this.errorMessage = null;
    }
  }

  createInterview(): void {
    if (!this.validateForm()) {
      this.sweetAlertService.showError(this.errorMessage!);
      return;
    }

    if (!this.availableSlots.includes(this.newInterview.interviewDate)) {
      this.errorMessage = 'Ce créneau n’est plus disponible. Veuillez en choisir un autre.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    const selectedJobOffer = this.jobOffers.find((offer) => offer.id === this.selectedJobOfferId);
    if (!selectedJobOffer) {
      this.errorMessage = 'Offre sélectionnée non trouvée.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    const candidateId = this.selectedCandidateId !== null ? Number(this.selectedCandidateId) : null;
    const selectedCandidate = this.candidates.find((candidate) => candidate.id === candidateId);
    if (!selectedCandidate) {
      this.errorMessage = 'Candidat sélectionné non trouvé.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    this.newInterview.jobOffer = { id: selectedJobOffer.id!, title: selectedJobOffer.title };
    this.newInterview.candidate = {
      id: selectedCandidate.id!,
      firstName: selectedCandidate.firstName,
      lastName: selectedCandidate.lastName,
      email: selectedCandidate.email // Add email
    };

    this.interviewService.createInterview(this.newInterview).subscribe({
      next: (interview) => {
        this.interviews.push(interview);
        this.sweetAlertService.showSuccess('Entretien créé avec succès !');

        if (this.googleAccessToken) {
          this.interviewService.addToGoogleCalendar(interview, this.googleAccessToken).subscribe({
            next: () => {
              this.sweetAlertService.showSuccess('Entretien ajouté à Google Calendar !');
            },
            error: (error) => {
              this.errorMessage = 'Erreur lors de l’ajout à Google Calendar : ' + error.message;
              this.sweetAlertService.showError(this.errorMessage);
            },
          });
        }

        this.resetForm();
        this.loadCalendarEvents();
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création de l’entretien : ' + error.message;
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  editInterview(interview: Interview): void {
    this.isEditing = true;
    this.editingInterviewId = interview.idInterview!;
    this.newInterview = { ...interview };
    this.selectedJobOfferId = interview.jobOffer && interview.jobOffer.id !== undefined ? interview.jobOffer.id : null;
    this.selectedCandidateId = interview.candidate && interview.candidate.id !== undefined ? interview.candidate.id : null;
    this.candidates = [];
    if (this.selectedJobOfferId) {
      this.isLoadingCandidates = true;
      this.interviewService.getCandidatesByJobOffer(this.selectedJobOfferId).subscribe({
        next: (data) => {
          this.candidates = data;
          this.isLoadingCandidates = false;
          if (this.candidates.length === 0) {
            this.errorMessage = 'Aucun candidat associé à cette offre.';
            this.sweetAlertService.showError(this.errorMessage);
          } else if (this.selectedCandidateId && !this.candidates.some((c) => c.id === this.selectedCandidateId)) {
            this.errorMessage = 'Le candidat associé à cet entretien n’est pas dans la liste actuelle.';
            this.sweetAlertService.showError(this.errorMessage);
            this.selectedCandidateId = null;
          } else {
            this.errorMessage = null;
            this.sweetAlertService.showSuccess('Candidats chargés pour modification !');
          }
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors du chargement des candidats : ' + error.message;
          this.sweetAlertService.showError(this.errorMessage);
          this.isLoadingCandidates = false;
        },
      });
    }
    this.sweetAlertService.showInfo('Mode modification activé pour l’entretien : ' + interview.name);
  }

  updateInterview(): void {
    if (!this.validateForm()) {
      this.sweetAlertService.showError(this.errorMessage!);
      return;
    }

    if (!this.availableSlots.includes(this.newInterview.interviewDate)) {
      this.errorMessage = 'Ce créneau n’est plus disponible. Veuillez en choisir un autre.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    const selectedJobOffer = this.jobOffers.find((offer) => offer.id === this.selectedJobOfferId);
    if (!selectedJobOffer) {
      this.errorMessage = 'Offre sélectionnée non trouvée.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    const candidateId = this.selectedCandidateId !== null ? Number(this.selectedCandidateId) : null;
    const selectedCandidate = this.candidates.find((candidate) => candidate.id === candidateId);
    if (!selectedCandidate) {
      this.errorMessage = 'Candidat sélectionné non trouvé.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    this.newInterview.jobOffer = { id: selectedJobOffer.id!, title: selectedJobOffer.title };
    this.newInterview.candidate = {
      id: selectedCandidate.id!,
      firstName: selectedCandidate.firstName,
      lastName: selectedCandidate.lastName,
      email: selectedCandidate.email // Add email
    };

    if (this.editingInterviewId !== null) {
      this.interviewService.updateInterview(this.editingInterviewId, this.newInterview).subscribe({
        next: (updatedInterview) => {
          const index = this.interviews.findIndex((i) => i.idInterview === this.editingInterviewId);
          if (index !== -1) {
            this.interviews[index] = updatedInterview;
          }
          this.sweetAlertService.showSuccess('Entretien mis à jour avec succès !');

          if (this.googleAccessToken) {
            this.interviewService.addToGoogleCalendar(updatedInterview, this.googleAccessToken).subscribe({
              next: () => {
                this.sweetAlertService.showSuccess('Entretien mis à jour dans Google Calendar !');
              },
              error: (error) => {
                this.errorMessage = 'Erreur lors de la mise à jour dans Google Calendar : ' + error.message;
                this.sweetAlertService.showError(this.errorMessage);
              },
            });
          }

          this.resetForm();
          this.loadCalendarEvents();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la mise à jour de l’entretien : ' + error.message;
          this.sweetAlertService.showError(this.errorMessage);
        },
      });
    }
  }

  deleteInterview(id: number): void {
    this.sweetAlertService.showInfo('Êtes-vous sûr de vouloir supprimer cet entretien ?');
    if (confirm('Voulez-vous vraiment supprimer cet entretien ?')) {
      this.interviewService.deleteInterview(id).subscribe({
        next: () => {
          this.interviews = this.interviews.filter((i) => i.idInterview !== id);
          this.sweetAlertService.showSuccess('Entretien supprimé avec succès !');
          this.loadCalendarEvents();
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression : ' + error.message;
          this.sweetAlertService.showError(this.errorMessage);
        },
      });
    }
  }

  resetForm(): void {
    this.newInterview = { name: '', description: '', interviewDate: '', interviewType: 'EMBAUCHE' };
    this.selectedJobOfferId = null;
    this.selectedCandidateId = null;
    this.candidates = [];
    this.errorMessage = null;
    this.isEditing = false;
    this.editingInterviewId = null;
    this.sweetAlertService.showInfo('Formulaire réinitialisé.');
  }

  private validateForm(): boolean {
    if (!this.newInterview.name || !this.newInterview.description || !this.newInterview.interviewDate) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return false;
    }
    if (this.selectedJobOfferId === null || this.selectedCandidateId === null) {
      this.errorMessage = 'Veuillez sélectionner une offre et un candidat.';
      return false;
    }
    if (this.isLoadingJobOffers || this.isLoadingCandidates) {
      this.errorMessage = 'Les données sont en cours de chargement. Veuillez patienter.';
      return false;
    }
    return true;
  }

  showCandidateTimeline(interview: Interview): void {
    if (!interview.candidate || !interview.candidate.id) {
      this.errorMessage = 'Aucun candidat associé à cet entretien.';
      this.sweetAlertService.showError(this.errorMessage);
      return;
    }

    this.selectedCandidateName = `${interview.candidate.firstName} ${interview.candidate.lastName}`;
    this.selectedCandidateActivities = [];

    // Add "Entretien planifié" activity
    this.selectedCandidateActivities.push({
      title: 'Entretien planifié',
      description: `Entretien planifié pour ${this.selectedCandidateName}.`,
      time: interview.interviewDate,
      icon: 'fas fa-calendar',
      badges: ['Entretien'],
    });

    // Find candidate in the candidates list for additional details
    const candidate = this.candidates.find((c) => c.id === interview.candidate!.id);

    if (candidate) {
      // Profil du candidat (updated to include score and CV)
      const scoreText = candidate.score !== undefined ? `Score: ${candidate.score}/100` : 'Score: Non attribué';
      const cvText = candidate.resume ? 'CV: Disponible' : 'CV: Non soumis';
      this.selectedCandidateActivities.push({
        title: 'Profil du candidat',
        description: `Nom: ${candidate.firstName} ${candidate.lastName}, Email: ${candidate.email}, Genre: ${candidate.gender}, ${scoreText}, ${cvText}`,
        time: candidate.applicationDate || interview.interviewDate,
        icon: 'fas fa-user',
        badges: ['Profil'],
        action: candidate.resume ? {
          label: 'Télécharger le CV',
          callback: () => this.downloadResume(candidate.resume, candidate.firstName, candidate.lastName),
        } : undefined,
      });

      // Candidature soumise
      if (candidate.applicationDate) {
        this.selectedCandidateActivities.push({
          title: 'Candidature soumise',
          description: `Candidature soumise par ${candidate.firstName} ${candidate.lastName}.`,
          time: candidate.applicationDate,
          icon: 'fas fa-file-alt',
          badges: ['Candidature'],
        });
      }

      // Statut
      if (candidate.status) {
        this.selectedCandidateActivities.push({
          title: `Statut: ${candidate.status}`,
          description: `Le statut du candidat est "${candidate.status}".`,
          time: candidate.applicationDate || interview.interviewDate,
          icon: 'fas fa-info-circle',
          badges: [candidate.status],
        });
      }

      // Acceptation
      if (candidate.acceptDate) {
        this.selectedCandidateActivities.push({
          title: 'Acceptation',
          description: `Le candidat a été accepté pour le poste.`,
          time: candidate.acceptDate,
          icon: 'fas fa-check-circle',
          badges: ['Accepté'],
        });
      }

      // Offres associées
      if (candidate.jobOffers && candidate.jobOffers.length > 0) {
        this.selectedCandidateActivities.push({
          title: 'Offres associées',
          description: `Offres: ${candidate.jobOffers.map((offer) => offer.title).join(', ')}`,
          time: candidate.applicationDate || interview.interviewDate,
          icon: 'fas fa-briefcase',
          badges: ['Offres'],
        });
      }
    }

    // Sort activities by time (most recent first)
    this.selectedCandidateActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    this.showTimeline = true;
    this.sweetAlertService.showSuccess(`Timeline chargée pour ${this.selectedCandidateName}`);
  }

  downloadResume(base64String: string, firstName: string, lastName: string): void {
    try {
      const base64Data = base64String.replace(/^data:application\/pdf;base64,/, '');
      const binaryString = window.atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${firstName}_${lastName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.errorMessage = 'Erreur lors du téléchargement du CV.';
      this.sweetAlertService.showError(this.errorMessage);
      console.error('Erreur downloadResume:', error);
    }
  }

  closeTimeline(): void {
    this.showTimeline = false;
    this.selectedCandidateActivities = [];
    this.selectedCandidateName = '';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TrainingService, Training } from '@/app/services/training.service';
import { KeycloakService } from 'keycloak-angular';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { FullCalendarModule } from '@fullcalendar/angular';
import { SocialAuthService, GoogleLoginProvider, SocialUser, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-training',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, FullCalendarModule, GoogleSigninButtonModule],
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent implements OnInit {
  trainings: Training[] = [];
  trainingForm: FormGroup;
  errorMessage: string | null = null;
  isEditing: boolean = false;
  editingTrainingId: number | null = null;
  googleAccessToken: string | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventColor: '#ff9800', // Orange pour les formations
  };

  constructor(
    private trainingService: TrainingService,
    private keycloakService: KeycloakService,
    private fb: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private socialAuthService: SocialAuthService
  ) {
    this.trainingForm = this.fb.group({
      trainingName: ['', [Validators.required, Validators.minLength(3)]],
      scheduledDate: ['', Validators.required],
      duration: [0, [Validators.required, Validators.min(1)]],
      completionRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        this.errorMessage = 'Veuillez vous connecter pour accéder aux formations.';
        this.sweetAlertService.showError(this.errorMessage);
        this.keycloakService.login();
        return;
      }

      this.socialAuthService.authState.subscribe((user: SocialUser) => {
        this.onGoogleSignIn(user);
      });

      this.loadTrainings();
      this.loadCalendarEvents();
    } catch (err) {
      this.errorMessage = 'Erreur lors de l’initialisation : ' + (err instanceof Error ? err.message : String(err));
      this.sweetAlertService.showError(this.errorMessage);
      console.error('Erreur dans ngOnInit', err);
    }
  }

  loadTrainings(): void {
    this.trainingService.getAllTrainings().subscribe({
      next: (data) => {
        this.trainings = Array.isArray(data) ? data : [];
        this.errorMessage = null;
        this.loadCalendarEvents();
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  loadCalendarEvents(): void {
    this.trainingService.getAllTrainings().subscribe({
      next: (trainings) => {
        this.calendarOptions.events = trainings.map((training) => {
          let startDateTime = training.scheduledDate;
          if (startDateTime.length <= 10) { // Si c'est juste yyyy-MM-dd
            startDateTime = `${startDateTime}T09:00:00`; // Ajouter une heure par défaut
          }
          return {
            id: String(training.trainingId),
            title: training.trainingName,
            start: startDateTime,
            end: new Date(new Date(startDateTime).getTime() + training.duration * 60 * 60 * 1000).toISOString(),
          };
        });
        this.sweetAlertService.showSuccess('Événements du calendrier chargés avec succès !');
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  createTraining(): void {
    if (this.trainingForm.invalid) {
      this.trainingForm.markAllAsTouched();
      this.sweetAlertService.showError('Veuillez remplir tous les champs correctement.');
      return;
    }
    const newTraining: Training = {
      ...this.trainingForm.value,
      scheduledDate: this.formatDateForBackend(this.trainingForm.value.scheduledDate),
    };
    this.trainingService.createTraining(newTraining).subscribe({
      next: (training) => {
        this.trainings.push(training);
        this.loadCalendarEvents();

        if (this.googleAccessToken) {
          this.trainingService.addToGoogleCalendar(training, this.googleAccessToken).subscribe({
            next: () => this.sweetAlertService.showSuccess('Formation ajoutée à Google Calendar !'),
            error: (error) => this.sweetAlertService.showError('Erreur Google Calendar : ' + error.message),
          });
        }

        this.resetForm();
        this.errorMessage = null;
        this.sweetAlertService.showSuccess('Formation créée avec succès !');
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  editTraining(training: Training): void {
    this.isEditing = true;
    this.editingTrainingId = training.trainingId!;
    this.trainingForm.patchValue({
      trainingName: training.trainingName,
      scheduledDate: training.scheduledDate.length > 10 ? training.scheduledDate : training.scheduledDate + 'T09:00',
      duration: training.duration,
      completionRate: training.completionRate,
    });
  }

  updateTraining(): void {
    if (this.trainingForm.invalid || this.editingTrainingId === null) {
      this.trainingForm.markAllAsTouched();
      this.sweetAlertService.showError('Veuillez remplir tous les champs correctement.');
      return;
    }
    const updatedTraining: Training = {
      ...this.trainingForm.value,
      scheduledDate: this.formatDateForBackend(this.trainingForm.value.scheduledDate),
    };
    this.trainingService.updateTraining(this.editingTrainingId, updatedTraining).subscribe({
      next: (updatedTraining) => {
        const index = this.trainings.findIndex((t) => t.trainingId === this.editingTrainingId);
        if (index !== -1) this.trainings[index] = updatedTraining;
        this.loadCalendarEvents();

        if (this.googleAccessToken) {
          this.trainingService.addToGoogleCalendar(updatedTraining, this.googleAccessToken).subscribe({
            next: () => this.sweetAlertService.showSuccess('Formation mise à jour dans Google Calendar !'),
            error: (error) => this.sweetAlertService.showError('Erreur Google Calendar : ' + error.message),
          });
        }

        this.resetForm();
        this.errorMessage = null;
        this.sweetAlertService.showSuccess('Formation mise à jour avec succès !');
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage);
      },
    });
  }

  deleteTraining(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette formation ?')) {
      this.trainingService.deleteTraining(id).subscribe({
        next: () => {
          this.trainings = this.trainings.filter((t) => t.trainingId !== id);
          this.loadCalendarEvents();
          this.errorMessage = null;
          this.sweetAlertService.showSuccess('Formation supprimée avec succès !');
        },
        error: (error) => {
          this.errorMessage = error instanceof Error ? error.message : String(error);
          this.sweetAlertService.showError(this.errorMessage);
        },
      });
    }
  }

  resetForm(): void {
    this.trainingForm.reset({ trainingName: '', scheduledDate: '', duration: 0, completionRate: 0 });
    this.isEditing = false;
    this.editingTrainingId = null;
  }

  handleEventClick(info: any): void {
    const training = this.trainings.find((t) => String(t.trainingId) === info.event.id);
    if (training) {
      // Ajuster le format de startDateTime pour qu'il soit compatible avec new Date()
      let startDateTime = training.scheduledDate;
      if (startDateTime.length <= 10) { // Si c'est juste yyyy-MM-dd
        startDateTime = `${training.scheduledDate}T09:00:00`; // Ajouter une heure par défaut au format ISO
      }

      // Calculer l'heure de fin
      const startDate = new Date(startDateTime);
      if (isNaN(startDate.getTime())) {
        console.error('Date invalide:', startDateTime);
        this.sweetAlertService.showError('Erreur: Date de la formation invalide.');
        return;
      }

      const endDate = new Date(startDate.getTime() + training.duration * 60 * 60 * 1000);

      // Formater les dates pour l'affichage
      const startDisplay = startDateTime.length <= 10
        ? `${training.scheduledDate} à 09:00`
        : startDateTime.replace('T', ' à ').substring(0, 16);
      const endDisplay = endDate
        .toISOString()
        .replace('T', ' à ')
        .substring(0, 16);

      Swal.fire({
        html: `
          <div style="text-align: left; font-family: Arial, sans-serif;">
            <h2 style="color: #1a73e8; font-size: 20px; margin-bottom: 10px;">${training.trainingName}</h2>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-calendar" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>${startDisplay} - ${endDisplay}</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-clock" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>Durée: ${training.duration} heures</span>
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <i class="las la-check-circle" style="color: #666; margin-right: 10px; font-size: 20px;"></i>
              <span>Taux de complétion: ${training.completionRate}%</span>
            </div>
          </div>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Fermer',
        customClass: {
          popup: 'swal2-custom-popup',
        },
      });
    }
  }

  onGoogleSignIn(user: SocialUser): void {
    this.socialAuthService.getAccessToken(GoogleLoginProvider.PROVIDER_ID).then((accessToken) => {
      this.googleAccessToken = accessToken;
      this.sweetAlertService.showSuccess('Connecté à Google Calendar !');

      const testTraining: Training = {
        trainingName: 'Test Formation',
        scheduledDate: new Date().toISOString().split('T')[0],
        duration: 1,
        completionRate: 0,
      };
      this.trainingService.addToGoogleCalendar(testTraining, this.googleAccessToken).subscribe({
        next: () => this.sweetAlertService.showSuccess('Formation de test ajoutée à Google Calendar !'),
        error: (error) => this.sweetAlertService.showError('Erreur lors du test Google Calendar : ' + error.message),
      });
    }).catch((err) => {
      this.errorMessage = 'Erreur lors de la connexion Google : ' + err.message;
      this.sweetAlertService.showError(this.errorMessage);
    });
  }

  private formatDateForBackend(date: string): string {
    if (date.length > 10) {
      return date.split('T')[0];
    }
    return date;
  }

  get f() { return this.trainingForm.controls; }
}

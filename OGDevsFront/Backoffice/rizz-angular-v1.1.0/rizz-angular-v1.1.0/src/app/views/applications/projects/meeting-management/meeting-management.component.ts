import { Component, OnInit, TemplateRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';
import { Meeting, UserEntity, MeetingRequest } from '@core/models/meeting.model';
import { MeetingService } from '@/app/services/MeetingService';
import { TicketService } from '@/app/services/ticket.service';
import { Ticket } from '@core/models/ticket.model';
import Swal from 'sweetalert2';
import { CalendarOptions, EventInput, EventClickArg, EventDropArg } from '@fullcalendar/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

// Interface temporaire pour DateClickArg
interface DateClickArg {
  date: Date;
  dateStr: string;
  allDay: boolean;
}

@Component({
  selector: 'app-meeting-management',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModalModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule
  ],
  templateUrl: './meeting-management.component.html',
  styleUrls: ['./meeting-management.component.css']
})
export class MeetingManagementComponent implements OnInit, OnDestroy {
  meetings: Meeting[] = [];
  displayedMeetings: Meeting[] = [];
  users: UserEntity[] = [];
  meetingForm: FormGroup;
  modifyForm: FormGroup;
  submitted: boolean = false;
  selectedMeetingId?: number;
  private usersSubscription: Subscription | null = null;
  adminTickets: Ticket[] = [];
  displayedAdminTickets: Ticket[] = [];
  calendarEvents: EventInput[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: (info: EventClickArg) => this.handleEventClick(info),
    dateClick: (info: DateClickArg) => this.handleDateClick(info),
    eventDrop: (info: EventDropArg) => this.handleEventDrop(info),
    editable: true,
    selectable: true
  };
  selectedUserFilter: string = '';

  // Pagination properties
  meetingsPage = 1;
  meetingsPageSize = 2;
  meetingsCollectionSize = 0;
  adminTicketsPage = 1;
  adminTicketsPageSize = 2;
  adminTicketsCollectionSize = 0;

  // New properties for password visibility toggle
  showAddPassword: boolean = false;
  showModifyPassword: boolean = false;

  @ViewChild('addMeetingModal', { static: true }) addMeetingModal!: TemplateRef<any>;
  @ViewChild('modifyMeetingModal', { static: true }) modifyMeetingModal!: TemplateRef<any>;

  constructor(
    private meetingService: MeetingService,
    private ticketService: TicketService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.meetingForm = this.fb.group({
      title: ['', Validators.required],
      meetingDate: ['', Validators.required],
      meetingTime: ['', Validators.required],
      meetingDuration: [60, [Validators.required, Validators.min(1)]],
      password: [''],
      clientId: ['', Validators.required]
    });
    this.modifyForm = this.fb.group({
      meetingStatus: ['', Validators.required],
      meetingDate: ['', Validators.required],
      meetingTime: ['', Validators.required],
      meetingDuration: [60, [Validators.required, Validators.min(1)]],
      password: [''],
      clientId: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadMeetings();
    await this.loadClients();
    await this.loadAdminTickets();
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  async loadMeetings(): Promise<void> {
    try {
      const meetingsObservable = await this.meetingService.getAllMeetings();
      meetingsObservable.subscribe({
        next: (data: Meeting[]) => {
          this.meetings = data.filter(meeting => meeting.meetingid != null && meeting.meetingDate != null && meeting.meetingTime != null);
          this.meetingsCollectionSize = this.meetings.length;
          this.refreshMeetings();
          console.log('Réunions chargées:', this.meetings);
          this.updateCalendarEvents();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors du chargement des réunions:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Erreur lors du chargement des réunions !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'initiation de loadMeetings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue lors du chargement !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async updateCalendarEvents(): Promise<void> {
    let filteredMeetings = this.meetings;
    if (this.selectedUserFilter) {
      try {
        const meetingsObservable = await this.meetingService.getMeetingsByUserId(this.selectedUserFilter);
        meetingsObservable.subscribe({
          next: (data: Meeting[]) => {
            filteredMeetings = data;
            this.renderCalendarEvents(filteredMeetings);
          },
          error: (error: HttpErrorResponse) => {
            console.error('Erreur lors du filtrage des réunions:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors du filtrage des réunions !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des réunions par utilisateur:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur inattendue est survenue lors du filtrage !',
          confirmButtonColor: '#5156be'
        });
      }
    } else {
      this.renderCalendarEvents(filteredMeetings);
    }
  }

  renderCalendarEvents(meetings: Meeting[]): void {
    this.calendarEvents = meetings
      .filter(meeting => meeting.meetingid && meeting.meetingDate && meeting.meetingTime)
      .map(meeting => {
        const startDateTime = `${meeting.meetingDate}T${meeting.meetingTime}`;
        const endDateTime = new Date(new Date(startDateTime).getTime() + (meeting.meetingDuration || 60) * 60000).toISOString();
        const color = this.getEventColor(meeting.meetingStatus);

        return {
          id: meeting.meetingid.toString(),
          title: `${meeting.meetingStatus} - ${this.getClientName(meeting)}`,
          start: startDateTime,
          end: endDateTime,
          backgroundColor: color,
          borderColor: color,
          extendedProps: { meeting }
        };
      });

    this.calendarOptions.events = this.calendarEvents;
    this.calendarOptions = { ...this.calendarOptions };
  }

  getEventColor(status: string): string {
    switch (status) {
      case 'PLANNED':
        return '#007bff';
      case 'IN_PROGRESS':
        return '#ffc107';
      case 'COMPLETED':
        return '#28a745';
      default:
        return '#6c757d';
    }
  }

  handleEventClick(info: EventClickArg): void {
    const meeting: Meeting = info.event.extendedProps['meeting'];
    this.openModifyMeetingModal(this.modifyMeetingModal, meeting);
  }

  handleDateClick(info: DateClickArg): void {
    const date = new Date(info.dateStr);
    const formattedDate = date.toISOString().split('T')[0];
    const formattedTime = date.toISOString().split('T')[1]?.slice(0, 5) || '09:00';

    this.meetingForm.patchValue({
      meetingDate: formattedDate,
      meetingTime: formattedTime
    });

    this.meetingForm.patchValue({
      title: '',
      meetingDuration: 60,
      password: '',
      clientId: ''
    });

    this.openAddMeetingModal(this.addMeetingModal);
  }

  handleEventDrop(info: EventDropArg): void {
    const meeting: Meeting = info.event.extendedProps['meeting'];
    const newStart = new Date(info.event.start!);
    const newEnd = info.event.end ? new Date(info.event.end) : new Date(newStart.getTime() + (meeting.meetingDuration || 60) * 60000);
    const duration = Math.round((newEnd.getTime() - newStart.getTime()) / 60000);

    const updatedMeeting: Meeting = {
      ...meeting,
      meetingDate: newStart.toISOString().split('T')[0],
      meetingTime: newStart.toISOString().split('T')[1].slice(0, 8),
      meetingDuration: duration,
      client: meeting.client
    };

    this.meetingService.updateMeeting(meeting.meetingid, updatedMeeting).then(meetingObservable => {
      meetingObservable.subscribe({
        next: () => {
          this.loadMeetings();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Réunion reprogrammée avec succès !',
            confirmButtonColor: '#5156be'
          });
        },
        error: (error: HttpErrorResponse) => {
          info.revert();
          console.error('Erreur lors de la reprogrammation de la réunion:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Échec de la reprogrammation de la réunion !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    }).catch(error => {
      info.revert();
      console.error('Erreur lors de l\'initiation de handleEventDrop:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue !',
        confirmButtonColor: '#5156be'
      });
    });
  }

  onUserFilterChange(): void {
    this.updateCalendarEvents();
  }

  getClientName(meeting: Meeting): string {
    if (!meeting.client) {
      return 'Aucun client';
    }
    return meeting.client.username;
  }

  async loadClients(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('Utilisateur non connecté. Redirection vers la page de connexion.');
        this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });

      const url = 'http://localhost:8089/api/clients';

      this.usersSubscription = this.http.get<UserEntity[]>(url, { headers }).subscribe({
        next: (clients: UserEntity[]) => {
          this.users = clients;
          console.log('Clients chargés depuis le backend:', clients);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors de la récupération des clients depuis le backend:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les clients !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Keycloak:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Problème avec l\'authentification Keycloak !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  openAddMeetingModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.meetingForm.reset({
      title: '',
      meetingDate: '',
      meetingTime: '',
      meetingDuration: 60,
      password: '',
      clientId: ''
    });
    this.showAddPassword = false; // Reset password visibility
    this.modalService.open(content);
  }

  openModifyMeetingModal(content: TemplateRef<any>, meeting: Meeting): void {
    this.submitted = false;
    this.selectedMeetingId = meeting.meetingid;
    this.modifyForm.patchValue({
      meetingStatus: meeting.meetingStatus,
      meetingDate: meeting.meetingDate,
      meetingTime: meeting.meetingTime,
      meetingDuration: meeting.meetingDuration,
      password: meeting.password || '',
      clientId: meeting.client?.id || ''
    });
    this.showModifyPassword = false; // Reset password visibility
    this.modalService.open(content);
  }

  async createMeeting(): Promise<void> {
    this.submitted = true;
    if (this.meetingForm.valid) {
      const formValue = this.meetingForm.value;

      const meetingRequest: MeetingRequest = {
        title: formValue.title,
        date: formValue.meetingDate,
        time: formValue.meetingTime,
        duration: formValue.meetingDuration,
        password: formValue.password || undefined,
        clientId: formValue.clientId
      };

      try {
        const meetingObservable = await this.meetingService.createMeeting(meetingRequest);
        meetingObservable.subscribe({
          next: (newMeeting: Meeting) => {
            this.meetings.push(newMeeting);
            this.meetingsCollectionSize = this.meetings.length;
            this.refreshMeetings();
            this.updateCalendarEvents();
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Meeting Created Successfully ! The Client Is Notified With An Email.',
              confirmButtonColor: '#5156be'
            });
          },
          error: (error: HttpErrorResponse) => {
            console.error('Erreur lors de la création de la réunion:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Échec de la création de la réunion !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'initiation de createMeeting:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur inattendue est survenue !',
          confirmButtonColor: '#5156be'
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez remplir tous les champs requis correctement !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async modifyMeeting(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedMeetingId) {
      const formValue = this.modifyForm.value;

      const updatedMeeting: Meeting = {
        meetingid: this.selectedMeetingId,
        meetingStatus: formValue.meetingStatus,
        meetingDate: formValue.meetingDate,
        meetingTime: formValue.meetingTime,
        meetingDuration: formValue.meetingDuration,
        meetingLink: '',
        password: formValue.password || undefined,
        client: { id: formValue.clientId } as UserEntity
      };

      try {
        const meetingObservable = await this.meetingService.updateMeeting(this.selectedMeetingId, updatedMeeting);
        meetingObservable.subscribe({
          next: (meeting: Meeting) => {
            const index = this.meetings.findIndex(m => m.meetingid === meeting.meetingid);
            if (index !== -1) {
              this.meetings[index] = meeting;
            }
            this.meetingsCollectionSize = this.meetings.length;
            this.refreshMeetings();
            this.updateCalendarEvents();
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Réunion modifiée avec succès !',
              confirmButtonColor: '#5156be'
            });
          },
          error: (error: HttpErrorResponse) => {
            console.error('Erreur lors de la modification de la réunion:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Échec de la modification de la réunion !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'initiation de modifyMeeting:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur inattendue est survenue !',
          confirmButtonColor: '#5156be'
        });
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Attention',
        text: 'Veuillez remplir tous les champs requis correctement !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async deleteMeeting(id: number): Promise<void> {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Vous ne pourrez pas annuler cette action !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Non, annuler !'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteObservable = await this.meetingService.deleteMeeting(id);
          deleteObservable.subscribe({
            next: () => {
              this.meetings = this.meetings.filter(m => m.meetingid !== id);
              this.meetingsCollectionSize = this.meetings.length;
              this.refreshMeetings();
              this.updateCalendarEvents();
              Swal.fire({
                icon: 'success',
                title: 'Supprimé !',
                text: 'La réunion a été supprimée avec succès.',
                confirmButtonColor: '#5156be'
              });
            },
            error: (error: HttpErrorResponse) => {
              console.error('Erreur lors de la suppression de la réunion:', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Échec de la suppression de la réunion !',
                confirmButtonColor: '#5156be'
              });
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'initiation de deleteMeeting:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur inattendue est survenue !',
            confirmButtonColor: '#5156be'
          });
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          icon: 'info',
          title: 'Annulé',
          text: 'La suppression a été annulée.',
          confirmButtonColor: '#5156be'
        });
      }
    });
  }

  async updateMeetingStatus(meetingId: number, currentStatus: string): Promise<void> {
    const statuses = ['PLANNED', 'IN_PROGRESS', 'COMPLETED'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    Swal.fire({
      title: 'Changer le statut',
      text: `Voulez-vous changer le statut de "${currentStatus}" à "${nextStatus}" ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, changer !',
      cancelButtonText: 'Non, annuler !'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updateObservable = await this.meetingService.updateMeetingStatus(meetingId, nextStatus);
          updateObservable.subscribe({
            next: (updatedMeeting: Meeting) => {
              const index = this.meetings.findIndex(m => m.meetingid === meetingId);
              if (index !== -1) {
                this.meetings[index] = updatedMeeting;
              }
              this.meetingsCollectionSize = this.meetings.length;
              this.refreshMeetings();
              this.updateCalendarEvents();
              Swal.fire({
                icon: 'success',
                title: 'Succès',
                text: `Statut changé à ${nextStatus} !`,
                confirmButtonColor: '#5156be'
              });
            },
            error: (error: HttpErrorResponse) => {
              console.error('Erreur lors du changement de statut:', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Échec du changement de statut !',
                confirmButtonColor: '#5156be'
              });
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'initiation de updateMeetingStatus:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Une erreur inattendue est survenue !',
            confirmButtonColor: '#5156be'
          });
        }
      }
    });
  }

  get form() {
    return this.meetingForm.controls;
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }

  async loadAdminTickets(): Promise<void> {
    try {
      const ticketsObservable = await this.ticketService.getAllTicketsForAdmin();
      ticketsObservable.subscribe({
        next: (data: Ticket[]) => {
          this.adminTickets = data;
          this.adminTicketsCollectionSize = this.adminTickets.length;
          this.refreshAdminTickets();
          console.log('Tickets chargés pour admin:', JSON.stringify(this.adminTickets, null, 2));
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors du chargement des tickets pour admin:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Erreur lors du chargement des tickets pour admin !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'initiation de loadAdminTickets:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue lors du chargement des tickets !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  // Refresh methods for pagination
  refreshMeetings(): void {
    this.displayedMeetings = this.meetings.slice(
      (this.meetingsPage - 1) * this.meetingsPageSize,
      (this.meetingsPage - 1) * this.meetingsPageSize + this.meetingsPageSize
    );
    this.updateCalendarEvents(); // Ensure calendar reflects paginated data
  }

  refreshAdminTickets(): void {
    this.displayedAdminTickets = this.adminTickets.slice(
      (this.adminTicketsPage - 1) * this.adminTicketsPageSize,
      (this.adminTicketsPage - 1) * this.adminTicketsPageSize + this.adminTicketsPageSize
    );
  }

  // New methods for password visibility toggle
  toggleAddPassword(): void {
    this.showAddPassword = !this.showAddPassword;
  }

  toggleModifyPassword(): void {
    this.showModifyPassword = !this.showModifyPassword;
  }
}

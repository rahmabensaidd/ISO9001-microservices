import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Ticket, TicketStatus, TicketType } from '@core/models/ticket.model';
import { TicketService } from '@/app/services/ticket.service';
import Swal from 'sweetalert2';
import { Meeting } from "@core/models/meeting.model";
import { MeetingService } from "@/app/services/MeetingService";

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModalModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  displayedTickets: Ticket[] = [];
  ticketForm: FormGroup;
  modifyForm: FormGroup;
  submitted: boolean = false;
  selectedTicketId?: number;
  ticketStatuses = Object.values(TicketStatus);
  ticketTypes = Object.values(TicketType);
  userMeetings: Meeting[] = [];
  displayedMeetings: Meeting[] = [];

  // Pagination properties
  ticketsPage = 1;
  ticketsPageSize = 2;
  ticketsCollectionSize = 0;
  meetingsPage = 1;
  meetingsPageSize = 2;
  meetingsCollectionSize = 0;

  constructor(
    private ticketService: TicketService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private meetingService: MeetingService
  ) {
    this.ticketForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: [TicketStatus.OPEN, Validators.required],
      type: [TicketType.REQUEST, Validators.required]
    });
    this.modifyForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      status: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadTickets();
    await this.loadUserMeetings();
  }

  ngOnDestroy(): void {}

  async loadTickets(): Promise<void> {
    try {
      const ticketsObservable = await this.ticketService.getAllTickets();
      ticketsObservable.subscribe({
        next: (data: Ticket[]) => {
          this.tickets = data;
          this.ticketsCollectionSize = this.tickets.length;
          this.refreshTickets();
          console.log('Tickets chargés:', JSON.stringify(this.tickets, null, 2));
        },
        error: (error) => {
          console.error('Erreur lors du chargement des tickets:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Échec du chargement des tickets !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Error initiating loadTickets:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async loadUserMeetings(): Promise<void> {
    try {
      const meetingsObservable = await this.meetingService.getMeetingsByCurrentUser();
      meetingsObservable.subscribe({
        next: (data: Meeting[]) => {
          this.userMeetings = data;
          this.meetingsCollectionSize = this.userMeetings.length;
          this.refreshMeetings();
          console.log('Réunions chargées:', JSON.stringify(this.userMeetings, null, 2));
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors du chargement des réunions:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error?.message || 'Échec du chargement des réunions !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Error initiating loadUserMeetings:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  openAddTicketModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.ticketForm.reset({
      title: '',
      description: '',
      status: TicketStatus.OPEN,
      type: TicketType.REQUEST
    });
    this.modalService.open(content);
  }

  openModifyTicketModal(content: TemplateRef<any>, ticket: Ticket): void {
    this.submitted = false;
    this.selectedTicketId = ticket.id;
    this.modifyForm.patchValue({
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      type: ticket.type
    });
    this.modalService.open(content);
  }

  async createTicket(): Promise<void> {
    this.submitted = true;
    if (this.ticketForm.valid) {
      const newTicket: Ticket = this.ticketForm.value;
      try {
        const ticketObservable = await this.ticketService.createTicket(newTicket);
        ticketObservable.subscribe({
          next: (response: string) => {
            console.log('Ticket créé:', response);
            this.loadTickets();
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Ticket added successfully',
              confirmButtonColor: '#5156be'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la création du ticket:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error || 'Échec de la création du ticket !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Error initiating createTicket:', error);
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
        text: 'Veuillez remplir tous les champs requis !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async modifyTicket(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedTicketId) {
      const updatedTicket: Ticket = {
        id: this.selectedTicketId,
        ...this.modifyForm.value
      };
      try {
        const ticketObservable = await this.ticketService.updateTicket(this.selectedTicketId, updatedTicket);
        ticketObservable.subscribe({
          next: (response: string) => {
            console.log('Ticket modifié:', response);
            this.loadTickets();
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Ticket Modified successfully',
              confirmButtonColor: '#5156be'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la modification du ticket:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error || 'Échec de la modification du ticket !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Error initiating modifyTicket:', error);
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
        text: 'Veuillez remplir tous les champs requis !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async deleteTicket(id: number): Promise<void> {
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
          const deleteObservable = await this.ticketService.deleteTicket(id);
          deleteObservable.subscribe({
            next: (response: string) => {
              this.tickets = this.tickets.filter(t => t.id !== id);
              this.ticketsCollectionSize = this.tickets.length;
              this.refreshTickets();
              Swal.fire({
                icon: 'success',
                title: 'Supprimé !',
                text: 'Ticket Deleted successfully',
                confirmButtonColor: '#5156be'
              });
            },
            error: (error) => {
              console.error('Erreur lors de la suppression du ticket:', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.error || 'Échec de la suppression du ticket !',
                confirmButtonColor: '#5156be'
              });
            }
          });
        } catch (error) {
          console.error('Error initiating deleteTicket:', error);
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
    return this.ticketForm.controls;
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }

  // Méthode pour extraire une approximation du titre à partir de meetingLink avec protection contre undefined
  getMeetingTitle(meeting: Meeting): string {
    if (!meeting.meetingLink) {
      return 'Réunion sans titre';
    }
    const linkPart = meeting.meetingLink.replace('https://meet.jit.si/', '');
    const titlePart = linkPart.split('-')[0] || 'Réunion sans titre';
    return titlePart;
  }

  // Refresh methods for pagination
  refreshTickets(): void {
    this.displayedTickets = this.tickets.slice(
      (this.ticketsPage - 1) * this.ticketsPageSize,
      (this.ticketsPage - 1) * this.ticketsPageSize + this.ticketsPageSize
    );
  }

  refreshMeetings(): void {
    this.displayedMeetings = this.userMeetings.slice(
      (this.meetingsPage - 1) * this.meetingsPageSize,
      (this.meetingsPage - 1) * this.meetingsPageSize + this.meetingsPageSize
    );
  }
}

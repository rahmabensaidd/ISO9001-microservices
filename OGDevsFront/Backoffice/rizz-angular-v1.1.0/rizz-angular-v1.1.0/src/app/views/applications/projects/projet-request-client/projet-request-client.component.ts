import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { ProjetRequest, StatutRequestProjet } from '@core/models/projet-request.model';
import { ProjetRequestService } from '@/app/services/projet-request.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-projet-request-client',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModalModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './projet-request-client.component.html',
  styleUrls: ['./projet-request-client.component.css']
})
export class ProjetRequestClientComponent implements OnInit {
  projetRequests: ProjetRequest[] = [];
  displayedProjetRequests: ProjetRequest[] = [];
  projetRequestForm: FormGroup;
  modifyForm: FormGroup;
  submitted: boolean = false;
  selectedProjetRequestId?: number;
  userEmail: string = '';
  StatutRequestProjet = StatutRequestProjet;

  // Pagination properties
  projetRequestsPage = 1;
  projetRequestsPageSize = 2;
  projetRequestsCollectionSize = 0;

  @ViewChild('addProjetRequestModal', { static: true }) addProjetRequestModal!: TemplateRef<any>;
  @ViewChild('modifyProjetRequestModal', { static: true }) modifyProjetRequestModal!: TemplateRef<any>;

  constructor(
    private projetRequestService: ProjetRequestService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.projetRequestForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      budgetProposedByClient: ['', [Validators.required, Validators.min(0)]],
      desiredStartDate: ['', Validators.required],
      desiredEndDate: ['', Validators.required],
      description: ['', Validators.required]
    });
    this.modifyForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      budgetProposedByClient: ['', [Validators.required, Validators.min(0)]],
      desiredStartDate: ['', Validators.required],
      desiredEndDate: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserEmail();
    await this.loadProjetRequests();
  }

  async loadUserEmail(): Promise<void> {
    try {
      const profile = await this.keycloakService.loadUserProfile();
      this.userEmail = profile.email || '';
      this.projetRequestForm.patchValue({ email: this.userEmail });
      this.modifyForm.patchValue({ email: this.userEmail });
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Impossible de charger l\'email de l\'utilisateur !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  async loadProjetRequests(): Promise<void> {
    try {
      const projetRequestsObservable = await this.projetRequestService.getProjetRequestsByCurrentUser();
      projetRequestsObservable.subscribe({
        next: (data: ProjetRequest[]) => {
          this.projetRequests = data;
          this.projetRequestsCollectionSize = this.projetRequests.length;
          this.refreshProjetRequests();
          console.log('Demandes de projet chargées:', JSON.stringify(this.projetRequests, null, 2));
        },
        error: (error) => {
          console.error('Erreur lors du chargement des demandes de projet:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Erreur lors du chargement des demandes de projet !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de loadProjetRequests:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  openAddProjetRequestModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.projetRequestForm.reset({ email: this.userEmail });
    this.modalService.open(content);
  }

  openModifyProjetRequestModal(content: TemplateRef<any>, projetRequest: ProjetRequest): void {
    this.submitted = false;
    this.selectedProjetRequestId = projetRequest.id;
    this.modifyForm.patchValue({
      email: this.userEmail,
      budgetProposedByClient: projetRequest.budgetProposedByClient,
      desiredStartDate: projetRequest.desiredStartDate,
      desiredEndDate: projetRequest.desiredEndDate,
      description: projetRequest.description
    });
    this.modalService.open(content);
  }

  async createProjetRequest(): Promise<void> {
    this.submitted = true;
    if (this.projetRequestForm.valid) {
      const newProjetRequest: Partial<ProjetRequest> = {
        ...this.projetRequestForm.getRawValue(),
        statut: StatutRequestProjet.EN_ATTENTE
      };
      try {
        const projetRequestObservable = await this.projetRequestService.createProjetRequest(newProjetRequest);
        projetRequestObservable.subscribe({
          next: (result: string) => {
            this.loadProjetRequests();
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Project Request Sent Successfully To Manager',
              confirmButtonColor: '#5156be'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la création de la demande:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.message || 'Échec de la création de la demande !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de createProjetRequest:', error);
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

  async modifyProjetRequest(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedProjetRequestId) {
      const updatedProjetRequest: Partial<ProjetRequest> = this.modifyForm.getRawValue();
      try {
        const projetRequestObservable = await this.projetRequestService.updateProjetRequest(
          this.selectedProjetRequestId,
          updatedProjetRequest
        );
        projetRequestObservable.subscribe({
          next: (result: string) => {
            this.loadProjetRequests();
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Project Request Updated Successfully',
              confirmButtonColor: '#5156be'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la modification de la demande:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.message || 'Échec de la modification de la demande !',
              confirmButtonColor: '#5156be'
            });
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de modifyProjetRequest:', error);
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

  async deleteProjetRequest(id: number): Promise<void> {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous ne pourrez pas annuler cette action !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Non, annuler !'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteObservable = await this.projetRequestService.deleteProjetRequest(id);
          deleteObservable.subscribe({
            next: (result: string) => {
              this.projetRequests = this.projetRequests.filter(pr => pr.id !== id);
              this.projetRequestsCollectionSize = this.projetRequests.length;
              this.refreshProjetRequests();
              Swal.fire({
                icon: 'success',
                title: 'Deleted !',
                text: 'Project Request Deleted Successfully',
                confirmButtonColor: '#5156be'
              });
            },
            error: (error) => {
              console.error('Erreur lors de la suppression de la demande:', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message || 'Échec de la suppression de la demande !',
                confirmButtonColor: '#5156be'
              });
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de deleteProjetRequest:', error);
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

  refreshProjetRequests(): void {
    this.displayedProjetRequests = this.projetRequests.slice(
      (this.projetRequestsPage - 1) * this.projetRequestsPageSize,
      (this.projetRequestsPage - 1) * this.projetRequestsPageSize + this.projetRequestsPageSize
    );
  }

  get form() {
    return this.projetRequestForm.controls;
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }
}

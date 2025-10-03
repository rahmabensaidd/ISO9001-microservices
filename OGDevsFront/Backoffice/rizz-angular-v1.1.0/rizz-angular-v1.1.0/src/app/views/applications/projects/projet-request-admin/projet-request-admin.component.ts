import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjetRequest, ProjectStatsDTO, StatutRequestProjet } from '@core/models/projet-request.model';
import { ProjetRequestService } from '@/app/services/projet-request.service';
import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { KeycloakProfile } from 'keycloak-js';
import { KeycloakService } from 'keycloak-angular';
import { BudgetRequest, BudgetResponse } from '@core/models/budget.model';
import {BudgetService} from "@/app/services/bugdet.service";

@Component({
  selector: 'app-projet-request-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModalModule
  ],
  templateUrl: './projet-request-admin.component.html',
  styleUrls: ['./projet-request-admin.component.css']
})
export class ProjetRequestAdminComponent implements OnInit {
  projetRequests: ProjetRequest[] = [];
  projectStats: ProjectStatsDTO[] = [];
  modifyForm: FormGroup;
  submitted: boolean = false;
  selectedProjetRequestId?: number;
  StatutRequestProjet = StatutRequestProjet;
  currentUserEmail: string | undefined;
  @ViewChild('modifyProjetRequestModal', { static: true }) modifyProjetRequestModal!: TemplateRef<any>;

  constructor(
    private projetRequestService: ProjetRequestService,
    private budgetService: BudgetService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private keycloakService: KeycloakService
  ) {
    this.modifyForm = this.fb.group({
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      budgetProposedByClient: [{ value: '', disabled: true }, [Validators.required, Validators.min(0)]],
      desiredStartDate: [{ value: '', disabled: true }, Validators.required],
      desiredEndDate: [{ value: '', disabled: true }, Validators.required],
      heuresPrevues: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      statut: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadProjetRequests();
    await this.loadProjectStats();
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ L'utilisateur n'est pas connecté.");
        await this.keycloakService.login();
        return;
      }

      const userProfile: KeycloakProfile = await this.keycloakService.loadUserProfile();
      this.currentUserEmail = userProfile.email;

      if (!this.currentUserEmail) {
        console.error("❌ L'email de l'utilisateur n'est pas disponible.");
        return;
      }

      const token = await this.keycloakService.getToken();
      if (!token) {
        console.error('❌ Token manquant ou invalide');
        await this.keycloakService.login();
        return;
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'authentification ou de la récupération du profil :", error);
    }
  }

  async loadProjetRequests(): Promise<void> {
    try {
      const projetRequestsObservable = await this.projetRequestService.getAllProjetRequests();
      projetRequestsObservable.subscribe({
        next: (data: ProjetRequest[]) => {
          this.projetRequests = data;
          console.log('Demandes de projet chargées:', this.projetRequests);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors du chargement des demandes:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les demandes de projet !',
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

  async loadProjectStats(): Promise<void> {
    try {
      const projectStatsObservable = await this.projetRequestService.getProjectStats();
      projectStatsObservable.subscribe({
        next: (data: ProjectStatsDTO[]) => {
          this.projectStats = data;
          console.log('Statistiques des projets chargées:', this.projectStats);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Erreur lors du chargement des statistiques:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les statistiques des projets !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de loadProjectStats:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  openModifyProjetRequestModal(content: TemplateRef<any>, projetRequest: ProjetRequest): void {
    this.submitted = false;
    this.selectedProjetRequestId = projetRequest.id;
    this.modifyForm.patchValue({
      email: projetRequest.email,
      budgetProposedByClient: projetRequest.budgetProposedByClient,
      desiredStartDate: projetRequest.desiredStartDate,
      desiredEndDate: projetRequest.desiredEndDate,
      heuresPrevues: projetRequest.heuresPrevues,
      description: projetRequest.description ?? '',
      statut: projetRequest.statut
    });
    this.modalService.open(content);
  }

  async modifyProjetRequest(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedProjetRequestId) {
      const formValue = this.modifyForm.getRawValue();
      const updatedProjetRequest: Partial<ProjetRequest> = {
        statut: formValue.statut
      };
      try {
        const updateObservable = await this.projetRequestService.updateProjetRequest(this.selectedProjetRequestId, updatedProjetRequest);
        updateObservable.subscribe({
          next: () => {
            this.loadProjetRequests();
            this.modalService.dismissAll();
            this.submitted = false;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Erreur lors de la modification:', error);
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
        text: 'Veuillez sélectionner un statut valide !',
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
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteObservable = await this.projetRequestService.deleteProjetRequest(id);
          deleteObservable.subscribe({
            next: () => {
              this.projetRequests = this.projetRequests.filter(pr => pr.id !== id);
            },
            error: (error: HttpErrorResponse) => {
              console.error('Erreur lors de la suppression:', error);
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

  async acceptProjetRequest(id: number): Promise<void> {
    Swal.fire({
      title: 'Accepter la demande ?',
      text: 'Cette action marquera la demande comme acceptée et créera un projet.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, accepter !',
      cancelButtonText: 'Annuler'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const acceptObservable = await this.projetRequestService.acceptProjetRequest(id, this.currentUserEmail);
          acceptObservable.subscribe({
            next: () => {
              this.loadProjetRequests();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Erreur lors de l\'acceptation:', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.message || 'Échec de l\'acceptation de la demande !',
                confirmButtonColor: '#5156be'
              });
            }
          });
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de acceptProjetRequest:', error);
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

  async estimateBudgetForProject(projetRequest: ProjetRequest): Promise<void> {
    const startDate = new Date(projetRequest.desiredStartDate);
    const endDate = new Date(projetRequest.desiredEndDate);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Format de date invalide !',
        confirmButtonColor: '#5156be'
      });
      return;
    }

    // Validate description
    const description = projetRequest.description?.trim();
    if (!description) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'La description ne peut pas être vide !',
        confirmButtonColor: '#5156be'
      });
      return;
    }

    // Calculate duration in days
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Convert days to months (assuming 30 days per month), round up
    const durationMonths = Math.ceil(days / 30);

    // Validate duration (1 to 24 months)
    if (durationMonths < 1 || durationMonths > 24) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'La durée doit être entre 1 et 24 mois !',
        confirmButtonColor: '#5156be'
      });
      return;
    }

    const budgetRequest: BudgetRequest = {
      description: description,
      duration: durationMonths
    };

    try {
      const budgetObservable = await this.budgetService.estimateBudget(budgetRequest);
      budgetObservable.subscribe({
        next: (response: BudgetResponse) => {
          // Format the budget breakdown for display
          const salaryBreakdown = Object.entries(response.salary_breakdown)
            .map(([role, details]) => `${role}: ${details}`)
            .join('<br>');
          const materialBreakdown = Object.entries(response.material_breakdown)
            .map(([tool, details]) => `${tool}: ${details}`)
            .join('<br>');

          Swal.fire({
            icon: 'success',
            title: 'Estimation Réussie',
            html: `
              <strong>Type de projet :</strong> ${response.project_type}<br>
              <strong>Budget prédit par IA :</strong> €${response.predicted_budget.toFixed(2)}<br>
              <strong>Budget basé sur règles :</strong> €${response.rule_based_budget.toFixed(2)}<br>
              <strong>Total salaires :</strong> €${response.salary_cost.toFixed(2)}<br>
              <strong>Total matériel :</strong> €${response.material_cost.toFixed(2)}<br>
              <strong>Répartition des salaires :</strong><br>${salaryBreakdown || 'N/A'}<br>
              <strong>Répartition du matériel :</strong><br>${materialBreakdown || 'N/A'}<br>

            `,
            confirmButtonColor: '#5156be'
          });
        },
        error: (error: Error) => {
          console.error('Erreur lors de l\'estimation du budget:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.message || 'Échec de l\'estimation du budget !',
            confirmButtonColor: '#5156be'
          });
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de estimateBudgetForProject:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Une erreur inattendue est survenue !',
        confirmButtonColor: '#5156be'
      });
    }
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }
}

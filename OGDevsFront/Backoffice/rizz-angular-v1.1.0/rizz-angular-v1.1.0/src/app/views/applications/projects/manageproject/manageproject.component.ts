import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Phase, Project, ProjectOperation, Resource, UserDTO } from '@core/models/project.model';
import { Phasesugg, ProjectService } from '@/app/services/project.service'
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbDropdown, NgbDropdownModule, NgbModalRef, NgbPagination, NgbTooltip } from '@ng-bootstrap/ng-bootstrap'
import { Operation } from '@core/models/operation.model';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import {DatepickerDirective} from "@core/directive/datepickr.directive";
import {finalize, Observable} from "rxjs";
import {catchError, switchMap, tap} from "rxjs/operators";
interface Technology {
  name: string;
  type: string;
  description: string;
}

// Un stack est un objet où les clés sont les types de technologies et les valeurs sont les noms
type TechnologyStack = { [key: string]: string };
@Component({
  selector: 'app-manageproject',
  templateUrl: './manageproject.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
    NgbModalModule,
    DatepickerDirective,
    NgbTooltip,
    NgbPagination,
  ],
  styleUrls: ['./manageproject.component.scss'],
  providers: [NgbDropdown],
  standalone: true,
})
export class ManageprojectComponent implements OnInit {
  isLoading: boolean = false;
  selectedPhase: any = {};
  currentPageByPhase: { [key: string]: number } = {};
  itemsPerPage = 5;
  currentOperationForm: FormGroup
  currentPhaseId: number | null = null
  isManualModalOpen: boolean = false;
  manualTechnologiesInput: string = '';
  isManualModalreqOpen : boolean = false;
  manualreqInput: string = '';
  @ViewChild('addOperationModal') addOperationModal!: TemplateRef<any>
  @ViewChild('adduserModal') adduserModal!: TemplateRef<any>
  @ViewChild('addPhaseModal') addPhaseModal!: TemplateRef<any>
  @ViewChild('suggestedPhasesModal') suggestedPhasesModal!: TemplateRef<any>;
  @ViewChild('updatePhaseModal') updatePhaseModal!: TemplateRef<any>;
  activeSection: string | null = null
  isTechExpanded: { [key: string]: boolean } = {}
  showUserModal: boolean = false
  suggestedTechnologies: { [projectId: string]: TechnologyStack[] } = {}
  loadingg: { [projectId: string]: boolean } = {}
  selectedUser: any
  assignedResources: Resource[] = []
  showResourcesTable = false
  selectedResources: Resource[] = []
  resources: Resource[] = []
  selectedProjectOperation: ProjectOperation | null = null
  projectId!: number
  project: Project | null = null
  phases: Phase[] = []
  loading: boolean = true
  error: string | null = null
  phaseForm: FormGroup
  users: UserDTO[] = []
  predictedDuration: string | null = null
  upperMargin: number | null = null
  loadingPrediction: { [projectId: number]: boolean } = {}
  suggestedPhases: Phasesugg[] = [];
  processOperations: Operation[] = []
  projectOperationsByPhase: { [key: number]: ProjectOperation[] } = {}
  userForm: FormGroup
  pagedOperationsByPhase: { [key: string]: any[] } = {}
  pageByPhase: { [key: string]: number } = {}
  pageSizeByPhase: { [key: string]: number } = {}
  selectedTechnologies: { [projectId: string]: { [type: string]: string } } = {} // Track selected technology per type per project
  pagedAssignedResources: any[] = []
  assignedResourcesPage: number = 1
  assignedResourcesPageSize: number = 3
  pagedResources: any[] = []
  resourcesPage: number = 1
  resourcesPageSize: number = 3
  isModalOpen: boolean = false;
  leftPhases: Phasesugg[] = [];
  rightPhases: Phasesugg[] = [];
  modalRef?: NgbModalRef;
  startOptions = {
    format: 'yyyy-mm-dd',
    autoClose: true,
  }

  endOptions = {
    format: 'yyyy-mm-dd',
    autoClose: true,
  }
  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.phaseForm = this.fb.group({
      phase_name: ['', Validators.required],
      description: ['', Validators.required],
    })

    this.userForm = this.fb.group({
      userId: ['', Validators.required],
    })

    this.currentOperationForm = this.fb.group({
      priority: ['', Validators.required],
      deadline: ['', Validators.required],
      processOperation: ['', Validators.required],
    })
  }

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'))
    if (!isNaN(this.projectId)) {
      this.assignedResourcesPage = 1 // Ensure default page is set
      this.assignedResourcesPageSize = 3 // Ensure default page size is set

      this.updatePagedResources()
      this.fetchProject()

      this.loadResources()
      this.projectService.getOperationsByProject(this.projectId).subscribe({
        next: (operationsData) => {
          this.processOperations = operationsData
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des opérations'
          console.error(error)
        },
      })
    } else {
      this.error = 'ID du projet invalide'
      this.loading = false
    }
  }

  toggleSection(section: string): void {
    this.activeSection = this.activeSection === section ? null : section

    this.assignedResourcesPage = 1 // Ensure default page is set
    this.assignedResourcesPageSize = 3 // Ensure default page size is set
    this.resourcesPage = 1
    this.resourcesPageSize = 3
    this.updatePagedResources()

    this.updatePagedAssignedResources()
  }

  toggleResourceSelection(resource: Resource): void {
    const index = this.selectedResources.findIndex(
      (r) => r.resourceId === resource.resourceId
    )
    if (index > -1) {
      this.selectedResources.splice(index, 1)
    } else {
      this.selectedResources.push(resource)
    }
  }

  loadResources(): void {
    this.projectService.getAllResources().subscribe({
      next: (data: Resource[]) => {
        this.resources = data.filter(
          (res) => res.type === 'Infrastructure' && res.status === 'Available'
        )
        console.log(
          'Filtered Resources loaded:',
          this.resources.length,
          this.resources
        )
      },
      error: (error: any) => {
        console.error('Error fetching resources', error)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load resources.',
          icon: 'error',
          confirmButtonColor: '#5156be',
        })
      },
    })
  }

  isSelected(resource: Resource): boolean {
    return this.selectedResources.some(
      (r) => r.resourceId === resource.resourceId
    )
  }

  assignSelectedResources(): void {
    if (this.selectedResources.length === 0) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please select at least one resource to assign.',
        icon: 'warning',
        confirmButtonColor: '#5156be',
      })
      return
    }

    const resourceIds = this.selectedResources.map(
      (resource) => resource.resourceId
    )
    this.projectService
      .assignResourcesToProject(this.projectId, resourceIds)
      .subscribe({
        next: (project: Project) => {
          Swal.fire({
            title: 'Success!',
            text: 'Resources assigned successfully.',
            icon: 'success',
            confirmButtonColor: '#5156be',
          })
          this.selectedResources = []
          this.loadResources()
          this.fetchProject()
        },
        error: (error) => {
          console.error('Error assigning resources:', error)
          Swal.fire({
            title: 'Error!',
            text: 'Failed to assign resources.',
            icon: 'error',
            confirmButtonColor: '#5156be',
          })
        },
      })
  }

  unassignResource(resourceId?: number): void {
    if (!resourceId) {
      Swal.fire({
        title: 'Error!',
        text: 'Invalid resource ID.',
        icon: 'error',
        confirmButtonColor: '#5156be',
      })
      return
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to unassign this resource from the project?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unassign it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService
          .unassignResourceFromProject(this.projectId, resourceId)
          .subscribe({
            next: () => {
              this.fetchProject()
              this.loadResources()
            },
            error: (error) => {
              console.error('Error unassigning resource:', error)
              Swal.fire({
                title: 'Error!',
                text: 'Failed to unassign resource.',
                icon: 'error',
                confirmButtonColor: '#5156be',
              })
            },
          })
      }
    })
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-success'
      case 'in use':
        return 'bg-warning'
      case 'maintenance':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  fetchProject(): void {
    this.projectService.getProjectById(this.projectId).subscribe({
      next: (data) => {
        this.project = data
        this.phases = data.phases || []
        this.assignedResources = data.resources ? [...data.resources] : []
        this.loading = false
        if (Array.isArray(this.phases)) {
          this.phases.forEach((phase) => {
            if (phase.idPhase) {
              this.fetchOperations(phase.idPhase)
            }
          })
        }
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du projet.'
        console.error('Erreur API :', err)
        this.loading = false
      },
    })
  }

  fetchPhases(): void {
    this.projectService.getPhasesByProjectId(this.projectId).subscribe({
      next: (data) => {
        this.phases = data || []

        // Trier les phases en utilisant une comparaison numérique
        this.phases.sort((a, b) => a.idPhase - b.idPhase)

        if (Array.isArray(this.phases)) {
          this.phases.forEach((phase) => {
            if (phase.idPhase) {
              this.fetchOperations(phase.idPhase)
            } else {
              console.error('Phase ID is undefined:', phase)
            }
          })
        } else {
          console.error("❌ phases n'est pas un tableau valide:", this.phases)
        }
        this.loading = false
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des phases du projet.'
        console.error('Erreur API :', err)
        this.loading = false
      },
    })
  }



  addPhase(modal: any): void {
    if (this.phaseForm.valid) {
      const newPhase: Phase = this.phaseForm.value
      this.projectService.addPhase(this.projectId, newPhase).subscribe({
        next: () => {
          this.fetchPhases()
          modal.close()
          this.phaseForm.reset()
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout de la phase:", error)
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add phase.',
            icon: 'error',
            confirmButtonColor: '#5156be',
          })
        },
      })
    }
  }





  fetchOperations(phaseId: number): void {
    this.projectService.getOperationsByPhase(phaseId).subscribe({
      next: (operations) => {
        const sortedOperations = (operations || []).sort(
          (a: ProjectOperation, b: ProjectOperation) =>
            (a.idProjectOperation ?? 0) - (b.idProjectOperation ?? 0)
        );

        this.projectOperationsByPhase[phaseId] = sortedOperations;
        this.updateAssignedResources()
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des opérations de phase', err);
      },
    });
  }

  openPhaseModal(modal: TemplateRef<any>): void {
    this.phaseForm.reset()
    this.modalService.open(modal)
  }

  openOperationModal(phaseId: number, modal: TemplateRef<any>): void {
    this.currentPhaseId = phaseId
    this.currentOperationForm.reset()
    this.modalService.open(modal)
  }

  addOperationWithModal(phaseId: number | null, modal: any): void {
    if (phaseId && this.currentOperationForm?.valid) {
      this.addOperation(phaseId)
      modal.close()
    }
  }

  addOperation(phaseId: number): void {
    if (!this.currentOperationForm?.valid) {
      console.warn('Operation form is invalid')
      return
    }
    const operationData: Partial<ProjectOperation> = {
      priority: this.currentOperationForm.value.priority,
      deadline: this.currentOperationForm.value.deadline,
      idoperation: Number(this.currentOperationForm.value.processOperation),
    }
    this.projectService
      .createProjectOperation(
        phaseId,
        operationData.idoperation!,
        operationData
      )
      .subscribe({
        next: () => {
          this.fetchOperations(phaseId)
          this.currentOperationForm.reset()
        },
        error: (error) => {
          console.error('Error adding operation:', error)
          this.error = 'An error occurred while adding the operation.'
          Swal.fire({
            title: 'Error!',
            text: 'Failed to add operation.',
            icon: 'error',
            confirmButtonColor: '#5156be',
          })
        },
      })
  }



  showadduserModal(
    operation: ProjectOperation,
    content: TemplateRef<any>
  ): void {
    this.selectedProjectOperation = operation
    this.loadUsersByProjectOperation(operation.idProjectOperation)
    this.modalService.open(content)
  }
  saveUserAssignment(): void {
    if (this.userForm.valid && this.selectedProjectOperation?.idProjectOperation) {
      const email = this.userForm.value.userId;
      this.loading = true;  // Ajouter un indicateur de chargement

      this.projectService
        .assignUserToProjectOperation(
          this.selectedProjectOperation.idProjectOperation,
          email
        )
        .pipe(
          switchMap(() => {
            // Optimisation : récupérer les phases et les opérations après l'affectation
            return this.fetchPhasesAndOperations();
          }),
          catchError((error) => {
            console.error("Erreur lors de l'affectation de l'utilisateur :", error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to assign user.',
              icon: 'error',
              confirmButtonColor: '#5156be',
            });
            this.loading = false; // Arrêter le chargement en cas d'erreur
            return [];
          })
        )
        .subscribe({
          next: () => {
            this.modalService.dismissAll();
            this.loading = false;  // Arrêter le chargement lorsque l'opération est terminée
          },
        });
    } else {
      console.warn('⚠️ Le formulaire est invalide.');
    }
  }

  fetchPhasesAndOperations(): Observable<void> {
    return this.projectService.getPhasesByProjectId(this.projectId).pipe(
      tap((data) => {
        this.phases = (data || []).sort((a:Phase, b:Phase) => (a.idPhase ?? 0) - (b.idPhase ?? 0));

        if (Array.isArray(this.phases)) {
          // Optimisation : éviter des appels supplémentaires inutiles
          this.phases.forEach((phase) => this.fetchOperationns(phase.idPhase));
        } else {
          console.error("❌ phases n'est pas un tableau valide:", this.phases);
        }
      }),
      catchError((err) => {
        this.error = 'Erreur lors du chargement des phases du projet.';
        console.error('Erreur API :', err);
        this.loading = false;
        return [];
      })
    );
  }


  fetchOperationns(phaseId: number): void {
    this.projectService.getOperationsByPhase(phaseId).subscribe({
      next: (operations) => {
        const sortedOperations = (operations || []).sort(
          (a: ProjectOperation, b: ProjectOperation) =>
            (a.idProjectOperation ?? 0) - (b.idProjectOperation ?? 0)
        );

        this.projectOperationsByPhase[phaseId] = sortedOperations;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération des opérations de phase', err);
      },
    });
  }



  loadUsersByProjectOperation(idProjectOperation?: number): void {
    if (idProjectOperation === undefined) {
      console.error('Impossible de charger les utilisateurs : ID indéfini.')
      return
    }
    this.projectService
      .getUsersByProjectOperation(idProjectOperation)
      .subscribe({
        next: (data: UserDTO[]) => {
          this.users = data
        },
        error: (error) => {
          console.error(
            'Erreur lors de la récupération des utilisateurs:',
            error
          )
        },
      })
  }

  deletePhase(id: number): void {
    this.projectService.deletePhase(id).subscribe({
      next: () => {
        this.fetchProject();

        // Afficher un message de succès après suppression réussie
        Swal.fire({
          title: 'Success!',
          text: 'Phase deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#5156be',
        });
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error.message);

        // Afficher un message d'erreur si la suppression échoue
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete phase.',
          icon: 'error',
          confirmButtonColor: '#5156be',
        });
      },
    });
  }


  deleteProjectOperation(id: number | undefined): void {
    if (!id) return;

    this.projectService.deleteProjectOperation(id).subscribe({
      next: () => {
        // Rafraîchir le projet et les phases après la suppression
        this.fetchProject();
        this.fetchPhases();

        // Afficher un message de succès avec SweetAlert
        Swal.fire({
          title: 'Success!',
          text: 'Project operation deleted successfully.',
          icon: 'success',
          confirmButtonColor: '#5156be',
        });
      },
      error: (error) => {
        console.error(
          "Erreur lors de la suppression de l'opération de projet:",
          error.message
        );

        // Afficher un message d'erreur avec SweetAlert
        Swal.fire({
          title: 'Error!',
          text: 'Failed to delete operation.',
          icon: 'error',
          confirmButtonColor: '#5156be',
        });
      },
    });
  }



  viewProjectBugs(id: number): void {
    if (id) {
      this.router.navigate(['/bugsforallproject', id])
    } else {
      console.error('Project ID not available')
    }
  }

  private updateAssignedResources(): void {
    this.assignedResources = this.project?.resources
      ? [...this.project.resources]
      : []
    const userEmails: Set<string> = new Set()

    // Guard against uninitialized projectOperationsByPhase
    if (this.projectOperationsByPhase) {
      Object.values(this.projectOperationsByPhase).forEach((operations) => {
        if (Array.isArray(operations)) {
          operations.forEach((operation) => {
            if (operation?.user?.email) {
              userEmails.add(operation.user.email)
            }
          })
        }
      })
    }

    if (userEmails.size === 0) {
      return
    }

    this.projectService.getAllResources().subscribe({
      next: (allResources: Resource[]) => {
        const userResources = allResources.filter(
          (resource) =>
            resource.user?.email && userEmails.has(resource.user.email)
        )
        userResources.forEach((resource) => {
          if (
            !this.assignedResources.some(
              (r) => r.resourceId === resource.resourceId
            )
          ) {
            this.assignedResources.push(resource)
          }
        })
      },
      error: (err) => {
        console.error('Error fetching all resources:', err)
        Swal.fire({
          title: 'Error!',
          text: 'Failed to load resources.',
          icon: 'error',
          confirmButtonColor: '#5156be',
        })
      },
    })
  }


  applyForProject(idProjet: number): void {
    this.loadingg[idProjet] = true;

    // Vérification de la validité des données pour le projet
    const technologies =
      this.selectedTechnologies[idProjet] && typeof this.selectedTechnologies[idProjet] === 'object'
        ? Object.values(this.selectedTechnologies[idProjet])  // Extraire toutes les valeurs (technologies)
          .map(tech => tech.trim())  // Nettoyer les chaînes (retirer les espaces superflus)
          .filter(tech => tech !== '')  // Filtrer les technologies vides
        : [];  // Si ce n'est pas un objet valide, on définit une liste vide

    // Si aucune technologie n'est sélectionnée, afficher un avertissement
    if (technologies.length === 0) {
      console.warn('Aucune technologie à appliquer pour le projet:', idProjet);
      Swal.fire({
        title: 'Aucune technologie',
        text: 'Aucune technologie suggérée à appliquer pour ce projet.',
        icon: 'warning',
        confirmButtonColor: '#5156be',
      });
      this.loadingg[idProjet] = false;
      return;
    }

    // Appeler le service pour ajouter les technologies au projet
    this.projectService
      .addTechnologiesToProject(idProjet, technologies)
      .subscribe({
        next: (updatedProject: Project) => {
          console.log('Technologies appliquées avec succès:', updatedProject);

          Swal.fire({
            title: 'Success !',
            text: 'Technologies has been added to project successfully.',
            icon: 'success',
            confirmButtonColor: '#5156be',
          });
          this.hideSuggestions(idProjet);
          this.fetchProject();
          // Mise à jour locale des technologies
          this.selectedTechnologies[idProjet] = updatedProject.technologies.reduce((acc: { [key: string]: string }, tech: string) => {
            // Ici, acc est maintenant un objet qui peut être indexé avec une clé de type string
            acc[tech] = tech;  // Ceci stocke chaque technologie comme clé et valeur
            return acc;
          }, {});

          // Vider selectedTechnologies après application
          this.selectedTechnologies[idProjet] = {};  // Réinitialiser l'objet après application
        },
        error: (error) => {
          console.error("Erreur lors de l'application des technologies:", error);

          Swal.fire({
            title: 'Erreur',
            text: "Une erreur s'est produite lors de l'application des technologies.",
            icon: 'error',
            confirmButtonColor: '#5156be',
          });

          this.loadingg[idProjet] = false;
        },
        complete: () => {
          this.loadingg[idProjet] = false;
        },
      });
  }




  suggestTechnologies(project: Project): void {
    this.loadingg[project.idProjet] = true;

    this.projectService
      .getTechnologySuggestions(
        project.projectType,
        project.description,
        project.requirements,
        project.expected_endDate
      )
      .pipe(
        finalize(() => {
          this.loadingg[project.idProjet] = false;
        })
      )
      .subscribe(
        (response: TechnologyStack[]) => {
          this.suggestedTechnologies[project.idProjet] = response;
          if (!this.selectedTechnologies[project.idProjet]) {
            this.selectedTechnologies[project.idProjet] = {};
            const types = this.getAllTypes(response);
            types.forEach((type) => {
              if (response.length > 0) {
                this.selectedTechnologies[project.idProjet][type] = response[0][type];
              }
            });
          }
        },
        (error) => {
          console.error('Erreur lors de la récupération des technologies', error);
        }
      );
  }

  // Récupérer tous les types de technologies (les clés des objets TechnologyStack)
  getAllTypes(stacks: TechnologyStack[]): string[] {
    if (!stacks || stacks.length === 0) {
      return []
    }
    // Map lowercase keys to their original case
    const typeMap = new Map<string, string>()
    for (const stack of stacks) {
      Object.keys(stack).forEach((type) => {
        const lowerType = type.toLowerCase()
        // Store the first occurrence of the key with its original case
        if (!typeMap.has(lowerType)) {
          typeMap.set(lowerType, type)
        }
      })
    }
    // Return the original keys
    return Array.from(typeMap.values())
  }


  selectTechnology(projectId: number, type: string, value: string): void {
    if (!this.selectedTechnologies[projectId]) {
      this.selectedTechnologies[projectId] = {}
    }
    this.selectedTechnologies[projectId][type] = value
  }

  isSelectedd(projectId: number, type: string, value: string): boolean {
    return (
      this.selectedTechnologies[projectId] &&
      this.selectedTechnologies[projectId][type] === value
    )
  }

  hideSuggestions(projectId: number): void {
    delete this.suggestedTechnologies[projectId]
    delete this.selectedTechnologies[projectId]
  }
  // Check if a cell is selected

  getUniqueValuesForType(stacks: TechnologyStack[], type: string): string[] {
    if (!stacks || stacks.length === 0) {
      return []
    }
    const valuesSet = new Set<string>()
    for (const stack of stacks) {
      const value = stack[type]
      if (value) {
        valuesSet.add(value)
      }
    }
    return Array.from(valuesSet)
  }

  // Pour trouver la technologie d'un type donné dans un stack
  getTechnologyByType(stack: Technology[], type: string): Technology | null {
    return stack.find((tech: Technology) => tech.type === type) || null
  }

  toggleTechDescription(projectId: number, techName: string) {
    const key = `${projectId}-${techName}`
    this.isTechExpanded[key] = !this.isTechExpanded[key]
  }

  applyDuration() {}

  savedates(projectId: number, startDate: string, endDate: string): void {
    // Assure-toi que les valeurs sont bien reçues
    console.log('Start Date:', startDate)
    console.log('End Date:', endDate)

    // Met à jour les valeurs dans le projet actuel
    if (this.project) {
      this.project.start_Date = startDate
      this.project.expected_endDate = endDate
    }

    // Appel au service pour sauvegarder les dates
    this.projectService
      .updateProjectDates(projectId, startDate, endDate)
      .subscribe(
        (updatedProject) => {
          console.log('Project updated:', updatedProject)
          this.project = updatedProject // Mise à jour du projet localement après la réponse du backend
          Swal.fire({
            title: 'Success!',
            text: 'Project dates have been updated.',
            icon: 'success',
            confirmButtonColor: '#5156be',
          })
        },
        (error) => {
          console.error('Error updating project:', error)
          Swal.fire({
            title: 'Error!',
            text: 'Failed to update project dates.',
            icon: 'error',
            confirmButtonColor: '#5156be',
          })
        }
      )
  }
  predictDuration(projectId: number): void {
    this.loadingPrediction[projectId] = true
    this.projectService.predictProjectDuration(projectId).subscribe({
      next: (result: string) => {
        this.predictedDuration = result

        // Conversion en nombre pour le calcul
        const numericDuration = Number(result)
        if (!isNaN(numericDuration)) {
          this.upperMargin = Math.ceil(numericDuration * 1.1) // +10% arrondi supérieur
          this.loadingPrediction[projectId] = false
        } else {
          console.error(
            'Le résultat de la prédiction n’est pas un nombre valide :',
            result
          )
          this.upperMargin = null
        }
      },
      error: (err) => {
        console.error('Erreur lors de la prédiction :', err)
        this.predictedDuration = 'Erreur lors de la prédiction.'
        this.upperMargin = null
      },
    })
  }

  applyDurationn(projectId: number, startDate: string): void {
    if (!this.predictedDuration) {
      Swal.fire('Warning', 'No predicted duration available.', 'warning')
      return
    }

    const start = new Date(startDate)
    const daysToAdd = parseInt(this.predictedDuration, 10)

    if (isNaN(start.getTime()) || isNaN(daysToAdd)) {
      Swal.fire('Error', 'Invalid start date or predicted duration.', 'error')
      return
    }

    const end = new Date(start)
    end.setDate(start.getDate() + daysToAdd)

    const endDateString = end.toISOString().split('T')[0] // yyyy-mm-dd

    // Appel de la méthode pour sauvegarder
    this.savedatess(projectId, startDate, endDateString)

    // Affichage avec SweetAlert2
    Swal.fire({
      icon: 'success',
      title: 'Project Dates Updated!',
      html: `
      <p><strong>Start Date:</strong> ${startDate}</p>
      <p><strong>End Date:</strong> ${endDateString}</p>
    `,
      confirmButtonText: 'OK',
    })
  }

  savedatess(projectId: number, startDate: string, endDate: string): void {
    // Assure-toi que les valeurs sont bien reçues
    console.log('Start Date:', startDate)
    console.log('End Date:', endDate)

    // Met à jour les valeurs dans le projet actuel
    if (this.project) {
      this.project.start_Date = startDate
      this.project.expected_endDate = endDate
    }

    // Appel au service pour sauvegarder les dates
    this.projectService
      .updateProjectDates(projectId, startDate, endDate)
      .subscribe(
        (updatedProject) => {
          console.log('Project updated:', updatedProject)
          this.project = updatedProject // Mise à jour du projet localement après la réponse du backend
        },
        (error) => {
          console.error('Error updating project:', error)
        }
      )
  }

  showPredictionWarning(projectId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Don’t forget to complete all the fields above so we can predict your project duration accurately..',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, predict!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.predictDuration(projectId)
      }
    })
  }

  updatePagedOperations(phaseId: number): void {
    const operations = this.projectOperationsByPhase[phaseId] || []
    const page = this.pageByPhase[phaseId] || 1
    const pageSize = this.pageSizeByPhase[phaseId] || 2
    const start = (page - 1) * pageSize
    const end = start + pageSize
    this.pagedOperationsByPhase[phaseId] = operations.slice(start, end)
  }


  updatePagedAssignedResources(): void {
    const start =
      (this.assignedResourcesPage - 1) * this.assignedResourcesPageSize
    const end = start + this.assignedResourcesPageSize
    this.pagedAssignedResources = this.assignedResources.slice(start, end)
  }

  updatePagedResources(): void {
    const start = (this.resourcesPage - 1) * this.resourcesPageSize
    const end = start + this.resourcesPageSize
    this.pagedResources = this.resources.slice(start, end)
  }

  onAssignedPageSizeChange(size: number): void {
    this.assignedResourcesPageSize = size
    this.assignedResourcesPage = 1
    this.updatePagedAssignedResources()
  }

  onResourcesPageSizeChange(size: number): void {
    this.resourcesPageSize = size
    this.resourcesPage = 1
    this.updatePagedResources()
  }



  openManualModal(): void {
    this.isManualModalOpen = true;
  }

  closeManualModal(): void {
    this.isManualModalOpen = false;
    this.manualTechnologiesInput = '';
  }

  saveManualTechnologies(): void {
    if (this.manualTechnologiesInput.trim()) {
      // Traiter l'entrée de l'utilisateur (séparer les exigences par des virgules)
      const requirements = this.manualTechnologiesInput.split(',').map(req => req.trim());

      // Appel au service pour ajouter les exigences au backend
      const idProject = this.project?.idProjet; // ID du projet
      this.projectService.addManytechs(idProject, requirements).subscribe({
        next: (response) => {
          console.log('Exigences ajoutées avec succès:', response);
          // Vous pouvez également mettre à jour la vue avec les nouvelles exigences
          this.closeManualModal();
          this.fetchProject();// Fermer le modal après la sauvegarde
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout des exigences:', err);
        }
      });
    } else {
      console.error('L\'entrée est vide. Veuillez entrer des exigences.');
    }
  }

  deleteTechnology(tech: string): void {

  }

  saveManualreq(): void {
    if (this.manualreqInput.trim()) {
      // Traiter l'entrée de l'utilisateur (séparer les exigences par des virgules)
      const requirements = this.manualreqInput.split(',').map(req => req.trim());

      // Appel au service pour ajouter les exigences au backend
      const idProject = this.project?.idProjet; // ID du projet
      this.projectService.addManyRequirements(idProject, requirements).subscribe({
        next: (response) => {
          console.log('Exigences ajoutées avec succès:', response);
          // Vous pouvez également mettre à jour la vue avec les nouvelles exigences
          this.closeManualModalreq();
          this.fetchProject();// Fermer le modal après la sauvegarde
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout des exigences:', err);
        }
      });
    } else {
      console.error('L\'entrée est vide. Veuillez entrer des exigences.');
    }
  }

  closeManualModalreq() {
    this.isManualModalreqOpen = false;
    this.manualreqInput = '';
  }

  openManualModalreq() {
    this.isManualModalreqOpen = true;
  }


  // Méthode pour supprimer une exigence
  deleteRequirement(requirement: string): void {
    // Vérifier si this.project est défini
    if (!this.project || !this.project.idProjet) {
      console.error('Projet ou ID du projet non défini.');
      return;
    }

    const idProject = this.project.idProjet;

    // Vérifier si this.project.requirements est défini
    if (!this.project.requirements) {
      console.warn('Aucune exigence trouvée pour ce projet.');
      return;
    }

    // Vérifier si l'exigence existe dans la liste
    const index = this.project.requirements.indexOf(requirement);
    if (index === -1) {
      console.warn(`L'exigence "${requirement}" n'existe pas dans la liste des exigences.`);
      return;
    }

    // Appel du service pour supprimer l'exigence
    this.projectService.deleterequirement(idProject, requirement).subscribe({
      next: (response) => {
        // Supprimer l'exigence de la liste locale
        this.project!.requirements.splice(index, 1); // Use ! since we already checked for undefined
        console.log('Exigence supprimée avec succès');
      },
      error: (err) => {
        console.error("Erreur lors de la suppression de l'exigence:", err);
      }
    });
  }


  deletetech(tech: string): void {
    // Vérifier si this.project est défini
    if (!this.project || !this.project.idProjet) {
      console.error('Projet ou ID du projet non défini.');
      return;
    }

    const idProject = this.project.idProjet;

    // Vérifier si this.project.requirements est défini
    if (!this.project.technologies) {
      console.warn('Aucune exigence trouvée pour ce projet.');
      return;
    }

    // Vérifier si l'exigence existe dans la liste
    const index = this.project.technologies.indexOf(tech);
    if (index === -1) {
      console.warn(`L'exigence "${tech}" n'existe pas dans la liste des exigences.`);
      return;
    }

    // Appel du service pour supprimer l'exigence
    this.projectService.deletertechnology(idProject, tech).subscribe({
      next: (response) => {
        // Supprimer l'exigence de la liste locale
        this.project!.technologies.splice(index, 1); // Use ! since we already checked for undefined
        console.log('tech supprimée avec succès');
      },
      error: (err) => {
        console.error("Erreur lors de la suppression de tech:", err);
      }
    });
  }


  // Méthode pour appeler le service et récupérer les phases suggérées

  suggestPhasesForProject(): void {
    this.isLoading = true;  // Active le loading
    if (!this.projectId) {
      console.error('Aucun projet sélectionné.');
      return;
    }

    this.projectService.suggestPhases(this.projectId).subscribe({
      next: (phases: Phasesugg[]) => {
        console.log('✅ Phases suggérées:', phases);
        this.suggestedPhases = phases;

        const midPoint = Math.ceil(this.suggestedPhases.length / 2);
        this.leftPhases = this.suggestedPhases.slice(0, midPoint);
        this.rightPhases = this.suggestedPhases.slice(midPoint);

        // ✅ Stocke la référence du modal ici
        this.modalRef = this.modalService.open(this.suggestedPhasesModal, {
          ariaLabelledBy: 'modal-basic-title',
          size: 'xl'
        });
        this.isLoading = false;  // Active le loading
      },
      error: (error) => {
        console.error('❌ Erreur lors de la récupération des phases:', error);
      }
    });
  }

  addPhasesToProject(): void {
    if (this.suggestedPhases.length === 0) {
      Swal.fire('Warning', 'Aucune phase à ajouter.', 'warning');
      return;
    }

    if (!this.projectId) {
      Swal.fire('Error', 'Project ID manquant.', 'error');
      return;
    }

    this.projectService.addPhasesToProject(this.projectId, this.suggestedPhases)

      .subscribe({
        next: (response) => {
          console.log('Phases successfully added:', response);

          Swal.fire('Succès', 'phases have been added successfully.', 'success');
          // optionnel : ferme le modal après ajout
          this.modalRef?.close();
          this.fetchProject();
          this.fetchPhases();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout des phases:', error);
          Swal.fire('Erreur', 'Une erreur est survenue lors de l\'ajout des phases.', 'error');
        }
      });
  }


  deleteallphases(projectId: number ) {
    if (!projectId) {
      console.error('❌ projectId invalide');
      return;
    }

    Swal.fire({
      title: 'Are yu sure ?',
      text: 'All phases will definitly be deleted  are you sure !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745', // bouton vert (comme ton bouton)
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteAllPhasesFromProject(projectId).subscribe({
          next: (response) => {
            this.fetchProject();
            this.fetchPhases();
            console.log('✅ Phases supprimées avec succès:', response);
            Swal.fire(
              'Deleted !',
              'All phases has been sussessfully deleted.',
              'success'
            );
            this.modalRef?.close();
            // 👉 Recharge tes données ici si besoin
            // this.loadProjectDetails(); // exemple
          },
          error: (error) => {
            console.error('❌ Erreur lors de la suppression des phases:', error);
            Swal.fire(
              'Erreur',
              'Une erreur est survenue lors de la suppression des phases.',
              'error'
            );
          }
        });
      }
    });
  }






  getPaginatedOperations(phaseId: number) {
    const allOps = this.projectOperationsByPhase[phaseId] || [];
    const currentPage = this.currentPageByPhase[phaseId] || 1;
    const startIndex = (currentPage - 1) * this.itemsPerPage;
    return allOps.slice(startIndex, startIndex + this.itemsPerPage);
  }


  changePage(phaseId: number, newPage: number): void {
    this.currentPageByPhase[phaseId] = newPage;
  }

  protected readonly Math = Math;



  getPaginatedAssignedResources() {
    const start = (this.assignedResourcesPage - 1) * this.assignedResourcesPageSize;
    const end = start + this.assignedResourcesPageSize;
    return this.assignedResources.slice(start, end);
  }

  getPaginatedResources() {
    const start = (this.resourcesPage - 1) * this.resourcesPageSize;
    const end = start + this.resourcesPageSize;
    return this.resources.slice(start, end);
  }

  onAssignedPageChange(page: number) {
    this.assignedResourcesPage = page;
    this.updatePagedAssignedResources()
  }

  onResourcesPageChange(page: number) {
    this.resourcesPage = page;
    this.updatePagedResources()
  }

  openUpdateModal(phase: any) {
    this.selectedPhase = { ...phase }; // Copier pour ne pas modifier directement
    const modalRef = this.modalService.open(this.updatePhaseModal);
    modalRef.result.then(
      result => {},
      reason => {}
    );
  }

// Méthode appelée quand on clique sur "Update"
// Méthode appelée quand on clique sur "Update"
  updatePhase(modal: any) {
    const { idPhase, phase_name, description } = this.selectedPhase;

    this.projectService.updatePhase(idPhase, phase_name, description).subscribe({
      next: (response) => {
        // Option 1 : rafraîchir tout (fetchPhases)
        this.fetchPhases();

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Phase updated successfully',
          timer: 2000,
          showConfirmButton: false
        });

        modal.close();
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour de la phase:', err);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while updating. Please try again..',
        });
      }
    });
  }

}

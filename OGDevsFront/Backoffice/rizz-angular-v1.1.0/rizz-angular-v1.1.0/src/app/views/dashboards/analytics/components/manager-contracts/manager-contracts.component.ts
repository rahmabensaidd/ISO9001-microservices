import { Component, OnInit, TemplateRef, OnDestroy } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContractClientService } from '@/app/services/contract-client.service';
import { ContractClient, ContractStatus } from '@core/models/contract-client.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular'; // Adjust import path as needed
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { Subscription } from 'rxjs';

// Assuming UserEntity interface for clients
interface UserEntity {
  id: number;
  username: string;
  // Add other properties if needed
}

@Component({
  selector: 'app-manager-contracts',
  standalone: true,
  imports: [
    CommonModule,
    NgbModalModule,
    NgbPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    KeyValuePipe
  ],
  templateUrl: './manager-contracts.component.html',
  styleUrls: ['./manager-contracts.component.css']
})
export class ManagerContractsComponent implements OnInit, OnDestroy {
  contracts: ContractClient[] = [];
  displayedContracts: ContractClient[] = []; // Paginated contracts to display
  selectedContract: ContractClient | null = null;
  contractForm: FormGroup;
  submitted: boolean = false;
  contractStatuses = Object.values(ContractStatus);
  contractsByStatus: { [key: string]: number } = {};
  contractsByClient: { [key: string]: number } = {};
  contractsByEcheance: ContractClient[] = [];
  echeanceStartDate: string = '';
  echeanceEndDate: string = '';
  performanceAnalysis: { [key: number]: { averageScore: number; alert: string; scoreHistory: { date: string; score: number }[] } } | null = null;
  users: UserEntity[] = []; // Store the list of clients
  private usersSubscription: Subscription | null = null; // To manage subscription

  // Pagination properties
  page = 1;
  pageSize = 2; // Default items per page (changed to 2)
  collectionSize = 0; // Total number of contracts

  constructor(
    private contractClientService: ContractClientService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpClient, // Inject HttpClient
    private keycloakService: KeycloakService // Inject KeycloakService
  ) {
    this.contractForm = this.fb.group({
      title: ['', Validators.required],
      contractNumber: ['', Validators.required],
      value: ['', [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      status: ['PENDING', Validators.required],
      clientId: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadContracts(), this.loadClients(), this.loadStats()]);
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe(); // Clean up subscription
    }
  }

  async loadContracts(): Promise<void> {
    try {
      const contractsObservable = await this.contractClientService.getAllContracts();
      contractsObservable.subscribe({
        next: (data: ContractClient[]) => {
          this.contracts = data;
          this.collectionSize = this.contracts.length; // Update collection size for pagination
          this.refreshContracts(); // Refresh displayed contracts
          console.log('Contracts loaded:', JSON.stringify(this.contracts, null, 2));
        },
        error: (error) => {
          console.error('Error loading contracts:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load contracts!',
            confirmButtonColor: '#5156be'
          } as SweetAlertOptions);
        }
      });
    } catch (error) {
      console.error('Error initiating loadContracts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred!',
        confirmButtonColor: '#5156be'
      } as SweetAlertOptions);
    }
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

  // Method to refresh the displayed contracts based on pagination
  refreshContracts(): void {
    this.displayedContracts = this.contracts
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }

  async loadStats(): Promise<void> {
    try {
      const statusObservable = await this.contractClientService.getContractsByStatus();
      statusObservable.subscribe({
        next: (data) => this.contractsByStatus = data,
        error: (error) => console.error('Error loading status stats:', error)
      });

      const clientObservable = await this.contractClientService.getContractsByClient();
      clientObservable.subscribe({
        next: (data) => this.contractsByClient = data,
        error: (error) => console.error('Error loading client stats:', error)
      });
    } catch (error) {
      console.error('Error initiating loadStats:', error);
    }
  }

  async loadContractsByEcheance(): Promise<void> {
    if (!this.echeanceStartDate || !this.echeanceEndDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select start and end dates!',
        confirmButtonColor: '#5156be'
      } as SweetAlertOptions);
      return;
    }
    try {
      const echeanceObservable = await this.contractClientService.getContractsByEcheance(this.echeanceStartDate, this.echeanceEndDate);
      echeanceObservable.subscribe({
        next: (data) => this.contractsByEcheance = data,
        error: (error) => {
          console.error('Error loading contracts by echeance:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load contracts by echeance!',
            confirmButtonColor: '#5156be'
          } as SweetAlertOptions);
        }
      });
    } catch (error) {
      console.error('Error initiating loadContractsByEcheance:', error);
    }
  }

  async loadPerformanceAnalysis(): Promise<void> {
    try {
      const performanceObservable = await this.contractClientService.analyzeContractsPerformance();
      performanceObservable.subscribe({
        next: (data) => this.performanceAnalysis = data,
        error: (error) => {
          console.error('Error loading performance analysis:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load performance analysis!',
            confirmButtonColor: '#5156be'
          } as SweetAlertOptions);
        }
      });
    } catch (error) {
      console.error('Error initiating loadPerformanceAnalysis:', error);
    }
  }

  openAddContractModal(content: TemplateRef<any>): void {
    this.submitted = false;
    const year = new Date().getFullYear();
    const contractCount = this.contracts.length + 1;
    const contractNumber = `CTR-${year}-${contractCount.toString().padStart(3, '0')}`;
    this.contractForm.reset({
      title: '',
      contractNumber: contractNumber,
      value: '',
      startDate: '',
      endDate: '',
      status: 'PENDING',
      clientId: ''
    });
    this.modalService.open(content);
  }

  openEditContractModal(content: TemplateRef<any>, contract: ContractClient): void {
    this.selectedContract = { ...contract };
    this.submitted = false;
    this.contractForm.reset({
      title: contract.title,
      contractNumber: contract.contractNumber,
      value: contract.value,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      clientId: contract.clientId
    });
    this.modalService.open(content);
  }

  openDetailsModal(content: TemplateRef<any>, contract: ContractClient): void {
    this.selectedContract = { ...contract };
    console.log('Selected contract details:', this.selectedContract);
    this.modalService.open(content).result.then(
      () => {},
      () => {}
    );
  }

  async createContract(): Promise<void> {
    this.submitted = true;
    if (this.contractForm.valid) {
      const newContract: ContractClient = {
        id: 0,
        title: this.contractForm.getRawValue().title,
        contractNumber: this.contractForm.getRawValue().contractNumber,
        value: Number(this.contractForm.getRawValue().value),
        startDate: this.contractForm.getRawValue().startDate,
        endDate: this.contractForm.getRawValue().endDate,
        status: this.contractForm.getRawValue().status as ContractStatus,
        clientId: this.contractForm.getRawValue().clientId,
        clientUsername: ''
      };
      try {
        const contractObservable = await this.contractClientService.createContract(newContract);
        contractObservable.subscribe({
          next: (response: ContractClient) => {
            this.contracts.push(response);
            this.collectionSize = this.contracts.length; // Update collection size
            this.refreshContracts(); // Refresh displayed contracts
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Contract created successfully',
              confirmButtonColor: '#5156be'
            } as SweetAlertOptions);
          },
          error: (error) => {
            console.error('Error creating contract:', error);
            let errorMessage = 'Failed to create contract!';
            if (error.status === 400) {
              errorMessage = error.error || 'Invalid contract data!';
            } else if (error.status === 403) {
              errorMessage = 'Access denied: Admin role required!';
            } else {
              errorMessage = error.error || error.message || errorMessage;
            }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              confirmButtonColor: '#5156be'
            } as SweetAlertOptions);
          }
        });
      } catch (error) {
        console.error('Error initiating createContract:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred!',
          confirmButtonColor: '#5156be'
        } as SweetAlertOptions);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please fill all required fields!',
        confirmButtonColor: '#5156be'
      } as SweetAlertOptions);
    }
  }

  async updateContract(): Promise<void> {
    this.submitted = true;
    if (this.contractForm.valid && this.selectedContract) {
      const updatedContract: ContractClient = {
        id: this.selectedContract.id,
        title: this.contractForm.getRawValue().title,
        contractNumber: this.contractForm.getRawValue().contractNumber,
        value: Number(this.contractForm.getRawValue().value),
        startDate: this.contractForm.getRawValue().startDate,
        endDate: this.contractForm.getRawValue().endDate,
        status: this.contractForm.getRawValue().status as ContractStatus,
        clientId: this.contractForm.getRawValue().clientId,
        clientUsername: this.selectedContract.clientUsername
      };
      try {
        const contractObservable = await this.contractClientService.updateContract(this.selectedContract.id, updatedContract);
        contractObservable.subscribe({
          next: (response: ContractClient) => {
            const index = this.contracts.findIndex(c => c.id === response.id);
            if (index !== -1) {
              this.contracts[index] = response;
            }
            this.refreshContracts(); // Refresh displayed contracts
            this.modalService.dismissAll();
            this.submitted = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Contract updated successfully',
              confirmButtonColor: '#5156be'
            } as SweetAlertOptions);
          },
          error: (error) => {
            console.error('Error updating contract:', error);
            let errorMessage = 'Failed to update contract!';
            if (error.status === 400) {
              errorMessage = error.error || 'Invalid contract data!';
            } else if (error.status === 403) {
              errorMessage = 'Access denied: Admin role required!';
            } else {
              errorMessage = error.error || error.message || errorMessage;
            }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              confirmButtonColor: '#5156be'
            } as SweetAlertOptions);
          }
        });
      } catch (error) {
        console.error('Error initiating updateContract:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An unexpected error occurred!',
          confirmButtonColor: '#5156be'
        } as SweetAlertOptions);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please fill all required fields!',
        confirmButtonColor: '#5156be'
      } as SweetAlertOptions);
    }
  }

  async deleteContract(id: number): Promise<void> {
    try {
      const deleteObservable = await this.contractClientService.deleteContract(id);
      deleteObservable.subscribe({
        next: () => {
          this.contracts = this.contracts.filter(c => c.id !== id);
          this.collectionSize = this.contracts.length; // Update collection size
          this.refreshContracts(); // Refresh displayed contracts
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Contract deleted successfully',
            confirmButtonColor: '#5156be'
          } as SweetAlertOptions);
        },
        error: (error) => {
          console.error('Error deleting contract:', error);
          let errorMessage = 'Failed to delete contract!';
          if (error.status === 403) {
            errorMessage = 'Access denied: Admin role required!';
          } else {
            errorMessage = error.error || error.message || errorMessage;
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonColor: '#5156be'
          } as SweetAlertOptions);
        }
      });
    } catch (error) {
      console.error('Error initiating deleteContract:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred!',
        confirmButtonColor: '#5156be'
      } as SweetAlertOptions);
    }
  }

  get form() {
    return this.contractForm.controls;
  }
}

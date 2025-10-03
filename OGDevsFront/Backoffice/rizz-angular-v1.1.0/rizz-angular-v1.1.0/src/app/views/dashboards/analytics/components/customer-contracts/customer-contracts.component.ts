import { Component, OnInit, TemplateRef, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { ContractClientService } from '@/app/services/contract-client.service';
import { ContractClient } from '@core/models/contract-client.model';
import { KeycloakService } from 'keycloak-angular';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { FaceCaptureComponent } from '@views/face-capture/face-capture.component';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-customer-contracts',
  standalone: true,
  imports: [
    CommonModule,
    NgbModalModule,
    NgbPaginationModule,
    FormsModule,
    FaceCaptureComponent
  ],
  templateUrl: './customer-contracts.component.html',
  styleUrls: []
})
export class CustomerContractsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('printableContent') printableContent!: ElementRef;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;

  contracts: ContractClient[] = [];
  displayedContracts: ContractClient[] = [];
  selectedContract: ContractClient | null = null;
  page = 1;
  pageSize = 2;
  collectionSize = 0;
  userId: string = '';
  currentDate: Date = new Date();
  showSignatureRequest: boolean = false;
  showFaceVerification: boolean = false;
  signatureType: 'draw' | 'text' | 'upload' = 'draw';
  signature: string = '';
  uploadedSignature: string | null = null;
  isDrawing: boolean = false;

  constructor(
    private contractClientService: ContractClientService,
    private modalService: NgbModal,
    private keycloakService: KeycloakService
  ) {}

  ngAfterViewInit(): void {
    console.log('Signature canvas initialized:', this.signatureCanvas?.nativeElement);
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserInfo();
    await this.loadContracts();
  }

  async loadUserInfo(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (isLoggedIn) {
        const token = await this.keycloakService.getToken();
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.userId = tokenPayload.sub || 'default-user-id';
      } else {
        Swal.fire('Erreur', 'Utilisateur non connecté.', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      Swal.fire('Erreur', 'Impossible de charger les informations utilisateur.', 'error');
    }
  }

  async loadContracts(): Promise<void> {
    try {
      const contractsObservable = await this.contractClientService.getContractsByCurrentUser();
      contractsObservable.subscribe({
        next: (data: ContractClient[]) => {
          this.contracts = data;
          this.collectionSize = this.contracts.length;
          this.refreshContracts();
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

  refreshContracts(): void {
    this.displayedContracts = this.contracts
      .slice(
        (this.page - 1) * this.pageSize,
        (this.page - 1) * this.pageSize + this.pageSize
      );
  }

  openDetailsModal(content: TemplateRef<any>, contract: ContractClient): void {
    this.selectedContract = { ...contract };
    console.log('Selected contract details:', this.selectedContract);
    console.log('Signature value:', this.selectedContract.signature);
    this.modalService.open(content).result.then(
      () => {},
      () => {}
    );
  }

  addSignature(): void {
    console.log('addSignature called');
    console.log('Current showSignatureRequest:', this.showSignatureRequest);
    this.showSignatureRequest = true;
    console.log('showSignatureRequest set to:', this.showSignatureRequest);
    console.log('Signature canvas:', this.signatureCanvas?.nativeElement);
  }

  startDrawing(event: MouseEvent): void {
    console.log('startDrawing called');
    this.isDrawing = true;
    const canvas = this.signatureCanvas?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(event.offsetX, event.offsetY);
    } else {
      console.error('Canvas context not found');
    }
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.signatureCanvas?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();
    }
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearCanvas(): void {
    const canvas = this.signatureCanvas?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  onSignatureUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedSignature = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  canSaveSignature(): boolean {
    if (this.signatureType === 'text') {
      return !!this.signature.trim();
    } else if (this.signatureType === 'upload') {
      return !!this.uploadedSignature;
    } else {
      const canvas = this.signatureCanvas?.nativeElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          return Array.from(imageData).some(pixel => pixel !== 0);
        }
      }
      return false;
    }
  }

  async saveSignature(): Promise<void> {
    if (!this.selectedContract || !this.selectedContract.id) {
      console.error('No selected contract or contract ID');
      Swal.fire('Erreur', 'Aucun contrat sélectionné.', 'error');
      return;
    }

    const signatureData = this.signatureType === 'text' ? this.signature :
      this.signatureType === 'upload' ? this.uploadedSignature! :
        this.signatureCanvas?.nativeElement.toDataURL('image/png');

    console.log('Saving signature:', signatureData?.substring(0, 50) + '...');

    try {
      const updatePayload = { signature: signatureData || null };
      const updateObservable = await this.contractClientService.updateContract(this.selectedContract.id, updatePayload);
      updateObservable.subscribe({
        next: (updatedContract) => {
          console.log('Contract updated:', updatedContract);
          this.selectedContract = updatedContract;
          const index = this.contracts.findIndex(c => c.id === updatedContract.id);
          if (index !== -1) {
            this.contracts[index] = updatedContract;
          }
          this.refreshContracts();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Signature enregistrée ! Veuillez vérifier votre identité.',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            this.showSignatureRequest = false;
            this.showFaceVerification = true;
          });
        },
        error: (error: any) => {
          console.error('Error saving signature:', error);
          Swal.fire('Erreur', `Erreur lors de l’ajout de la signature: ${error.message || error}`, 'error');
        }
      });
    } catch (error) {
      console.error('Error initiating saveSignature:', error);
      Swal.fire('Erreur', 'Erreur lors de la mise à jour du contrat.', 'error');
    }
  }

  cancelSignature(): void {
    this.showSignatureRequest = false;
    this.signature = '';
    this.uploadedSignature = null;
    this.clearCanvas();
  }

  isSignatureImage(signature: string | null | undefined): boolean {
    return !!signature && (signature.startsWith('data:image') || signature.includes('base64'));
  }

  downloadPDF(): void {
    const element = this.printableContent?.nativeElement;
    const title = this.selectedContract?.title || 'Contract';

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${title}.pdf`);
    });
  }

  onFaceVerified(verified: boolean): void {
    this.showFaceVerification = false;
    if (verified) {
      Swal.fire('Succès', 'Identité vérifiée avec succès !', 'success');
      this.loadContracts();
    } else {
      Swal.fire('Erreur', 'Échec de la vérification faciale.', 'error');
      if (this.selectedContract && this.selectedContract.id) {
        this.selectedContract.signature = null; // Changed to undefined for type safety
        this.contractClientService.updateContract(this.selectedContract.id, { signature: null }).then(updateObservable => {
          updateObservable.subscribe({
            next: (updatedContract) => {
              this.selectedContract = updatedContract;
              const index = this.contracts.findIndex(c => c.id === updatedContract.id);
              if (index !== -1) {
                this.contracts[index] = updatedContract;
              }
              this.refreshContracts();
              Swal.fire('Info', 'Signature supprimée en raison d’un échec de vérification.', 'info');
            },
            error: (error: any) => {
              Swal.fire('Erreur', `Erreur lors de la suppression de la signature: ${error.message || error}`, 'error');
            }
          });
        });
      }
    }
  }

  ngOnDestroy(): void {}
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { DocumentService } from '@/app/services/document.service';
import { Document, TypeDocument, TypeDocumentLabels } from '@/app/core/models/document.model';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { FaceCaptureComponent } from '@views/face-capture/face-capture.component';
import html2canvas from "html2canvas";

import { jsPDF } from 'jspdf';
@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, FaceCaptureComponent],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'scale(0.9)' }))
      ])
    ])
  ]
})
export class InvoiceComponent implements OnInit {
  @ViewChild('documentForm') documentForm!: NgForm;
  @ViewChild('printableContent') printableContent!: ElementRef;
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;

  TypeDocument = TypeDocument;

  userId: string = '';
  currentUser: string = 'Utilisateur Connecté';
  currentDate: Date = new Date();
  document: Document = { title: '', content: '', type: TypeDocument.FICHE_PAIE };
  invoices: Document[] = [];
  selectedDocument: Document | null = null;
  showSignatureRequest: boolean = false;
  showFaceVerification: boolean = false;
  signatureType: 'draw' | 'text' | 'upload' = 'draw';
  signature: string = '';
  uploadedSignature: string | null = null;
  isDrawing: boolean = false;
  defaultPosts: { [key: string]: { poste: string } } = {
    dev: { poste: 'Développeur' },
    manager: { poste: 'Manager' }
  };
  defaultPostKeys: string[] = Object.keys(this.defaultPosts);
  customPosts: { poste: string }[] = [];
  selectedPoste: string = '';
  isCustomPoste: boolean = false;
  customPoste: string = '';
  typeDocumentKeys = Object.keys(TypeDocument) as (keyof typeof TypeDocument)[];
  typeDocumentLabels = TypeDocumentLabels;

  constructor(
    private documentService: DocumentService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadDocuments();
  }

  async loadUserInfo(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (isLoggedIn) {
        const token = await this.keycloakService.getToken();
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.userId = tokenPayload.sub || 'default-user-id';
        this.currentUser = tokenPayload.name || tokenPayload.preferred_username || 'Utilisateur Connecté';
      } else {
        Swal.fire('Erreur', 'Utilisateur non connecté.', 'error');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations utilisateur:', error);
      Swal.fire('Erreur', 'Impossible de charger les informations utilisateur.', 'error');
    }
  }

  loadDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des documents:', error);
        Swal.fire('Erreur', 'Erreur lors de la récupération des documents.', 'error');
      }
    });
  }

  saveDocument(): void {
    if (this.documentForm.valid) {
      this.document.createdBy = { id: this.userId };
      this.document.dateCreation = new Date().toISOString();
      this.documentService.createDocument(this.document).subscribe({
        next: (newDocument) => {
          this.invoices.push(newDocument);
          Swal.fire('Succès', 'Document créé avec succès !', 'success');
          this.resetForm();
        },
        error: (error) => {
          Swal.fire('Erreur', `Erreur lors de la création: ${error.message}`, 'error');
        }
      });
    }
  }

  updateDocument(): void {
    if (this.documentForm.valid && this.document.id) {
      this.documentService.updateDocument(this.document.id, this.document).subscribe({
        next: (updatedDocument) => {
          const index = this.invoices.findIndex(inv => inv.id === updatedDocument.id);
          if (index !== -1) {
            this.invoices[index] = updatedDocument;
          }
          Swal.fire('Succès', 'Document mis à jour avec succès !', 'success');
          this.resetForm();
        },
        error: (error) => {
          Swal.fire('Erreur', `Erreur lors de la mise à jour: ${error.message}`, 'error');
        }
      });
    }
  }

  deleteDocument(id: number): void {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Voulez-vous vraiment supprimer ce document ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(id).subscribe({
          next: () => {
            this.invoices = this.invoices.filter(inv => inv.id !== id);
            Swal.fire('Succès', 'Document supprimé avec succès !', 'success');
            if (this.selectedDocument?.id === id) {
              this.selectedDocument = null;
            }
          },
          error: (error) => {
            Swal.fire('Erreur', `Erreur lors de la suppression: ${error.message}`, 'error');
          }
        });
      }
    });
  }

  selectDocument(invoice: Document): void {
    this.document = { ...invoice };
    this.selectedPoste = invoice.poste || '';
  }

  viewDocument(invoice: Document): void {
    this.selectedDocument = { ...invoice };
  }

  resetForm(): void {
    this.document = { title: '', content: '', type: TypeDocument.FICHE_PAIE };
    this.selectedPoste = '';
    this.isCustomPoste = false;
    this.customPoste = '';
    this.documentForm.resetForm();
  }

  cancelDocument(): void {
    this.selectedDocument = null;
  }

  onPosteChange(): void {
    this.isCustomPoste = this.selectedPoste === 'custom';
    this.document.poste = this.selectedPoste === 'custom' ? '' : this.selectedPoste;
  }

  addCustomPoste(): void {
    if (this.customPoste.trim()) {
      this.customPosts.push({ poste: this.customPoste.trim() });
      this.selectedPoste = this.customPoste.trim();
      this.document.poste = this.customPoste.trim();
      this.isCustomPoste = false;
      this.customPoste = '';
    }
  }

  addSignature(): void {
    this.showSignatureRequest = true;
  }

  startDrawing(event: MouseEvent): void {
    this.isDrawing = true;
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(event.offsetX, event.offsetY);
    }
  }

  draw(event: MouseEvent): void {
    if (!this.isDrawing) return;
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();
    }
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  clearCanvas(): void {
    const canvas = this.signatureCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
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

  saveSignature(): void {
    if (!this.selectedDocument) return;

    if (this.signatureType === 'text') {
      this.selectedDocument.signature = this.signature;
    } else if (this.signatureType === 'upload') {
      this.selectedDocument.signature = this.uploadedSignature!;
    } else {
      const canvas = this.signatureCanvas.nativeElement;
      this.selectedDocument.signature = canvas.toDataURL('image/png');
    }

    this.documentService.updateDocument(this.selectedDocument.id!, this.selectedDocument).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Signature enregistrée ! Veuillez vérifier votre identité.',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.showSignatureRequest = false;
          this.showFaceVerification = true; // Ouvre la webcam
        });
      },
      error: (error) => {
        Swal.fire('Erreur', `Erreur lors de l’ajout de la signature: ${error.message}`, 'error');
      }
    });
  }

  cancelSignature(): void {
    this.showSignatureRequest = false;
    this.signature = '';
    this.uploadedSignature = null;
    this.clearCanvas();
  }

  isSignatureImage(signature: string | undefined): boolean {
    return !!signature && (signature.startsWith('data:image') || signature.includes('base64'));
  }

  getFormattedContent(): string {
    if (!this.selectedDocument) return '';
    let content = `<p><strong>Type:</strong> ${this.typeDocumentLabels[this.selectedDocument.type]}</p>`;
    content += `<p><strong>Contenu:</strong> ${this.selectedDocument.content || 'N/A'}</p>`;
    if (this.selectedDocument.type === TypeDocument.FICHE_PAIE) {
      content += `<p><strong>Employé:</strong> ${this.selectedDocument.employe || 'N/A'}</p>`;
      content += `<p><strong>Poste:</strong> ${this.selectedDocument.poste || 'N/A'}</p>`;
      content += `<p><strong>Salaire Brut:</strong> ${this.selectedDocument.salaireBrut || 'N/A'} €</p>`;
      content += `<p><strong>Salaire Net:</strong> ${this.selectedDocument.salaireNet || 'N/A'} €</p>`;
      content += `<p><strong>Période:</strong> ${this.selectedDocument.periode || 'N/A'}</p>`;
    } else if (this.selectedDocument.type === TypeDocument.FICHE_POSTE) {
      content += `<p><strong>Poste:</strong> ${this.selectedDocument.poste || 'N/A'}</p>`;
      content += `<p><strong>Exigences:</strong> ${this.selectedDocument.exigenceDePoste || 'N/A'}</p>`;
      content += `<p><strong>Tâches:</strong> ${this.selectedDocument.taches || 'N/A'}</p>`;
    } else if (this.selectedDocument.type === TypeDocument.PROCESSUS_REALISATION) {
      content += `<p><strong>Désignation:</strong> ${this.selectedDocument.designation || 'N/A'}</p>`;
      content += `<p><strong>Axe:</strong> ${this.selectedDocument.axe || 'N/A'}</p>`;
      content += `<p><strong>Pilote:</strong> ${this.selectedDocument.pilote || 'N/A'}</p>`;
    } else if (this.selectedDocument.type === TypeDocument.CONTRAT) {
      content += `<p><strong>Employé:</strong> ${this.selectedDocument.employe || 'N/A'}</p>`;
      content += `<p><strong>Type Contrat:</strong> ${this.selectedDocument.typeContrat || 'N/A'}</p>`;
      content += `<p><strong>Date Début:</strong> ${this.selectedDocument.dateDebut || 'N/A'}</p>`;
      content += `<p><strong>Date Fin:</strong> ${this.selectedDocument.dateFin || 'N/A'}</p>`;
    }
    return content;
  }

  downloadPDF(): void {
    const element = this.printableContent.nativeElement;
    const title = this.selectedDocument?.title || 'Document';

    html2canvas(element, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Changed from jspdf.jsPDF to jsPDF
      const imgWidth = 190; // Width in mm (A4 width - 20mm margins)
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Start 10mm from top

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page content
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
      this.loadDocuments();
    } else {
      Swal.fire('Erreur', 'Échec de la vérification faciale.', 'error');
      if (this.selectedDocument) {
        this.selectedDocument.signature = ''; // Remove signature if verification fails
        this.documentService.updateDocument(this.selectedDocument.id!, this.selectedDocument).subscribe({
          next: () => {
            Swal.fire('Info', 'Signature supprimée en raison d’un échec de vérification.', 'info');
          },
          error: (error) => {
            Swal.fire('Erreur', `Erreur lors de la suppression de la signature: ${error.message}`, 'error');
          }
        });
      }
    }
  }
}

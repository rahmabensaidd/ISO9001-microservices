import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '@/app/services/auditt.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css']
})
export class AuditComponent {
  selectedFile: File | null = null;
  filename: string = '';
  fileSize: number = 0;
  textPreview: string = '';
  suggestions: string[] = [];
  selectedSuggestions: boolean[] = [];
  error: string = '';

  constructor(private auditService: AuditService, private toastr: ToastrService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.error = '';
    }
  }

  onUpload(): void {
    if (this.selectedFile) {
      this.auditService.uploadFile(this.selectedFile).subscribe({
        next: (response) => {
          this.filename = response.filename;
          this.fileSize = response.fileSize;
          this.textPreview = response.textPreview;
          this.suggestions = response.suggestions;
          this.selectedSuggestions = new Array(response.suggestions.length).fill(false);
          this.error = '';
          this.toastr.success('Fichier uploadé avec succès', 'Succès');
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de l\'upload du fichier';
          this.toastr.error(this.error, 'Erreur');
          this.filename = '';
          this.fileSize = 0;
          this.textPreview = '';
          this.suggestions = [];
          this.selectedSuggestions = [];
        }
      });
    } else {
      this.error = 'Aucun fichier sélectionné';
      this.toastr.error(this.error, 'Erreur');
    }
  }

  trackBySuggestion(index: number, suggestion: string): number {
    return index;
  }

  onSuggestionToggle(index: number): void {
    this.selectedSuggestions[index] = !this.selectedSuggestions[index];
  }

  onSave(): void {
    const selectedProposals = this.suggestions
      .filter((_, index) => this.selectedSuggestions[index])
      .map(proposal => proposal.trim());

    if (selectedProposals.length === 0) {
      this.toastr.error('Veuillez sélectionner au moins une proposition', 'Erreur');
      return;
    }

    this.auditService.saveNonConformity({
      nonConformity: this.textPreview,
      aiSuggestions: this.suggestions,
      correctionProposals: selectedProposals
    }).subscribe({
      next: () => {
        this.toastr.success('Non-conformité et propositions sauvegardées', 'Succès');
      },
      error: (err) => {
        this.toastr.error(err.error?.error || 'Erreur lors de la sauvegarde', 'Erreur');
      }
    });
  }
}

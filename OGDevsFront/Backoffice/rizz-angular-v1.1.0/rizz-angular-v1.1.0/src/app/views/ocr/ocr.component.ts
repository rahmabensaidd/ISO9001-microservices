import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {OcrService} from "@/app/services/OcrService";

interface Process {
  procName: string;
  description: string;
  creationDate: string;
}

interface Objective {
  title: string;
  axe: string;
  planAction?: string;
}

interface Operation {
  operationName: string;
  operationDescription: string;
  creationDate: string;
}

@Component({
  selector: 'app-ocr',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ocr.component.html',
  styleUrls: ['./ocr.component.css']
})
export class OcrComponent {
  imageUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  ocrResult: string = '';
  errorMessage: string = '';
  process: Process | null = null;
  objectives: Objective[] = [];
  operations: Operation[] = [];

  constructor(private ocrService: OcrService) {}

  handleFileChange(event: Event) {
    console.log('handleFileChange appelé');
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné:', this.selectedFile.name);
      const reader = new FileReader();
      reader.onload = (e) => this.imageUrl = reader.result;
      reader.readAsDataURL(this.selectedFile);
    } else {
      console.log('Aucun fichier sélectionné');
      this.errorMessage = 'Aucun fichier sélectionné';
      this.clearResults();
    }
  }

  confirmUpload() {
    console.log('confirmUpload appelé');
    this.clearResults();

    if (!this.selectedFile) {
      console.error('Aucun fichier sélectionné');
      this.errorMessage = 'Aucun fichier sélectionné';
      return;
    }

    this.ocrService.uploadImage(this.selectedFile).subscribe({
      next: (res: any) => {
        console.log('Réponse reçue de Flask:', res);
        this.ocrResult = res.text || '';
        this.process = res.process || null;
        this.objectives = res.objectives || [];
        this.operations = res.operations || [];
        this.errorMessage = '';

        // Sauvegarde dans Spring Boot
        this.ocrService.saveOcrData(res).subscribe({
          next: (response: { message: string } | string) => {
            console.log('Données enregistrées dans Spring Boot:', typeof response === 'string' ? response : response.message);
            this.errorMessage = '';
          },
          error: (err: HttpErrorResponse) => {
            console.error('Erreur lors de l\'enregistrement dans Spring Boot:', err);
            this.errorMessage = err.message || 'Erreur lors de l\'enregistrement';
          }
        });
      },
      error: (err: HttpErrorResponse) => {
        console.error('Erreur lors de l\'analyse OCR:', err);
        this.errorMessage = err.message || 'Erreur lors de l\'analyse OCR';
        this.clearResults();
      }
    });
  }

  private clearResults() {
    this.ocrResult = '';
    this.process = null;
    this.objectives = [];
    this.operations = [];
    this.errorMessage = '';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { EvaluationService, Evaluation } from '@/app/services/evaluation.service';
import { TrainingService, Training } from '@/app/services/training.service';
import { KeycloakService } from 'keycloak-angular';
import { SweetAlertService } from '@/app/services/sweet-alert.service'; // Import SweetAlertService

@Component({
  selector: 'app-evaluation',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, FormsModule],
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.scss'],
})
export class EvaluationComponent implements OnInit {
  evaluations: Evaluation[] = [];
  evaluationForm!: FormGroup;
  errorMessage: string | null = null;
  isEditing: boolean = false;
  editingEvaluationId: number | null = null;
  trainings: Training[] = [];

  constructor(
    private evaluationService: EvaluationService,
    private trainingService: TrainingService,
    private keycloakService: KeycloakService,
    private fb: FormBuilder,
    private sweetAlertService: SweetAlertService // Inject SweetAlertService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        this.errorMessage = 'Veuillez vous connecter pour accéder aux évaluations.';
        this.keycloakService.login();
        return;
      }
      this.loadEvaluations();
      this.loadTrainings();
      this.initializeForm();
    } catch (err) {
      this.errorMessage = 'Erreur lors de l’initialisation : ' + (err instanceof Error ? err.message : String(err));
      this.sweetAlertService.showError(this.errorMessage); // Show error with SweetAlert
      console.error('Erreur dans ngOnInit', err);
    }
  }

  initializeForm(): void {
    this.evaluationForm = this.fb.group({
      evalution_date: ['', Validators.required],
      performanceScore: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      comment: ['', [Validators.required, Validators.minLength(5)]],
      trainingName: ['', Validators.required]
    });
  }

  loadEvaluations(): void {
    this.evaluationService.getAllEvaluations().subscribe({
      next: (data) => {
        console.log('Évaluations récupérées :', data);
        this.evaluations = data;
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage); // Show error with SweetAlert
        console.error('Erreur lors du chargement des évaluations:', error);
      },
    });
  }

  loadTrainings(): void {
    this.trainingService.getAllTrainings().subscribe({
      next: (data) => {
        console.log('Formations récupérées :', data);
        this.trainings = data;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des formations : ' + (error instanceof Error ? error.message : String(error));
        this.sweetAlertService.showError(this.errorMessage); // Show error with SweetAlert
        console.error('Erreur lors du chargement des formations:', error);
      },
    });
  }

  createEvaluation(): void {
    if (this.evaluationForm.invalid) {
      this.evaluationForm.markAllAsTouched();
      this.sweetAlertService.showError('Veuillez remplir tous les champs correctement.');
      return;
    }
    const newEvaluation: Evaluation = this.evaluationForm.value;
    this.evaluationService.createEvaluation(newEvaluation).subscribe({
      next: (evaluation) => {
        this.evaluations.push(evaluation);
        this.resetForm();
        this.errorMessage = null;
        this.sweetAlertService.showSuccess('Évaluation ajoutée avec succès !'); // Success alert
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage); // Error alert
        console.error('Erreur lors de la création de l’évaluation:', error);
      },
    });
  }

  editEvaluation(evaluation: Evaluation): void {
    this.isEditing = true;
    this.editingEvaluationId = evaluation.idEvaluation!;
    this.evaluationForm.patchValue(evaluation);
  }

  updateEvaluation(): void {
    if (this.evaluationForm.invalid || this.editingEvaluationId === null) {
      this.evaluationForm.markAllAsTouched();
      this.sweetAlertService.showError('Veuillez remplir tous les champs correctement.');
      return;
    }
    const updatedEvaluation: Evaluation = this.evaluationForm.value;
    this.evaluationService.updateEvaluation(this.editingEvaluationId, updatedEvaluation).subscribe({
      next: (updatedEvaluation) => {
        const index = this.evaluations.findIndex((i) => i.idEvaluation === this.editingEvaluationId);
        if (index !== -1) {
          this.evaluations[index] = updatedEvaluation;
        }
        this.resetForm();
        this.errorMessage = null;
        this.sweetAlertService.showSuccess('Évaluation mise à jour avec succès !'); // Success alert
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage); // Error alert
        console.error('Erreur lors de la mise à jour de l’évaluation:', error);
      },
    });
  }

  deleteEvaluation(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette évaluation ?')) {
      this.evaluationService.deleteEvaluation(id).subscribe({
        next: () => {
          this.evaluations = this.evaluations.filter((i) => i.idEvaluation !== id);
          this.errorMessage = null;
          this.sweetAlertService.showSuccess('Évaluation supprimée avec succès !'); // Success alert
        },
        error: (error) => {
          this.errorMessage = error instanceof Error ? error.message : String(error);
          this.sweetAlertService.showError(this.errorMessage); // Error alert
          console.error('Erreur lors de la suppression de l’évaluation:', error);
        },
      });
    }
  }

  resetForm(): void {
    this.evaluationForm.reset({
      evalution_date: '',
      performanceScore: 0,
      comment: '',
      trainingName: ''
    });
    this.isEditing = false;
    this.editingEvaluationId = null;
  }

  get f() { return this.evaluationForm.controls; }
}

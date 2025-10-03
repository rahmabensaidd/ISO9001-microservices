import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { JobOfferService, JobOffer } from '@/app/services/job-offre.service';
import { CandidateService } from '@/app/services/candidate.service';
import { KeycloakService } from 'keycloak-angular';
import { Candidate } from '@/app/core/models/candidate.model';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-job-offre',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './job-offre.component.html',
  styleUrls: ['./job-offre.component.scss'],
})
export class JobOffreComponent implements OnInit {
  jobOffers: JobOffer[] = [];
  candidates: Candidate[] = [];
  sortedCandidates: Candidate[] = [];
  selectedJobOfferId: number | null = null;
  jobOfferForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isEditing: boolean = false;
  editingJobOfferId: number | null = null;

  // Listes pour les menus déroulants correspondant aux énumérations
  contractTypes = ['CDI', 'CDD', 'CVP', 'FREELANCE', 'INTERIM'];
  workTypes = ['PRESENTIAL', 'REMOTE', 'HYBRID'];

  constructor(
    private jobOfferService: JobOfferService,
    private candidateService: CandidateService,
    private keycloakService: KeycloakService,
    private fb: FormBuilder,
    private sweetAlertService: SweetAlertService
  ) {
    // Initialisation du formulaire avec tous les champs de l'entité JobOffer
    this.jobOfferForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      location: ['', Validators.required],
      requirements: ['', Validators.required],
      contractType: ['', Validators.required],
      salary: ['', [Validators.required, Validators.min(0)]],
      skillsAndExpertise: ['', Validators.required],
      workType: ['', Validators.required]
    });
  }

  // Getter pour accéder aux contrôles du formulaire
  get f() {
    return this.jobOfferForm.controls;
  }

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      console.log('Utilisateur connecté ?', isLoggedIn);
      if (!isLoggedIn) {
        this.errorMessage = 'Veuillez vous connecter pour accéder aux offres d’emploi.';
        this.sweetAlertService.showError(this.errorMessage);
        this.keycloakService.login();
        return;
      }
      this.loadJobOffers();
      this.loadCandidates();
    } catch (err) {
      this.errorMessage = 'Erreur lors de l’initialisation : ' + (err instanceof Error ? err.message : String(err));
      this.sweetAlertService.showError(this.errorMessage);
      console.error('Erreur dans ngOnInit', err);
    }
  }

  loadJobOffers(): void {
    this.jobOfferService.getAllJobOffers().subscribe({
      next: (data) => {
        this.jobOffers = Array.isArray(data) ? data : [];
        this.errorMessage = null;
        console.log('Offres d’emploi chargées :', this.jobOffers);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des offres : ' + (error.message || error);
        this.sweetAlertService.showError(this.errorMessage);
        console.error('Erreur lors du chargement des offres:', error);
      },
    });
  }

  loadCandidates(): void {
    this.candidateService.getAllCandidates().subscribe({
      next: (data) => {
        this.candidates = Array.isArray(data) ? data : [];
        this.errorMessage = null;
        console.log('Candidats chargés :', this.candidates);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des candidats : ' + (error.message || error);
        this.sweetAlertService.showError(this.errorMessage);
        console.error('Erreur lors du chargement des candidats:', error);
      },
    });
  }

  loadSortedCandidates(jobOfferId: number): void {
    this.selectedJobOfferId = jobOfferId;
    this.candidateService.getCandidatesSortedByScore(jobOfferId).subscribe({
      next: (data) => {
        this.sortedCandidates = Array.isArray(data) ? data : [];
        this.errorMessage = null;
        console.log('Candidats triés chargés :', this.sortedCandidates);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des candidats triés : ' + (error.message || error);
        this.sweetAlertService.showError(this.errorMessage);
        console.error('Erreur lors du chargement des candidats triés:', error);
      },
    });
  }

  createJobOffer(): void {
    if (this.jobOfferForm.invalid) {
      this.jobOfferForm.markAllAsTouched();
      this.sweetAlertService.showError('Veuillez remplir tous les champs correctement.');
      return;
    }
    const newJobOffer: JobOffer = this.jobOfferForm.value;
    this.jobOfferService.createJobOffer(newJobOffer).subscribe({
      next: (jobOffer) => {
        this.jobOffers.push(jobOffer);
        this.resetForm();
        this.errorMessage = null;
        this.successMessage = 'Offre d’emploi créée avec succès !';
        this.sweetAlertService.showSuccess(this.successMessage);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la création de l’offre : ' + (error.message || error);
        this.sweetAlertService.showError(this.errorMessage);
        console.error('Erreur lors de la création de l’offre:', error);
      },
    });
  }

  editJobOffer(jobOffer: JobOffer): void {
    this.isEditing = true;
    this.editingJobOfferId = jobOffer.id!;
    this.jobOfferForm.patchValue({
      title: jobOffer.title,
      description: jobOffer.description,
      location: jobOffer.location,
      requirements: jobOffer.requirements,
      contractType: jobOffer.contractType,
      salary: jobOffer.salary,
      skillsAndExpertise: jobOffer.skillsAndExpertise,
      workType: jobOffer.workType
    });
  }

  updateJobOffer(): void {
    if (this.jobOfferForm.invalid || this.editingJobOfferId === null) {
      this.jobOfferForm.markAllAsTouched();
      this.sweetAlertService.showError('Veuillez remplir tous les champs correctement.');
      return;
    }
    const updatedJobOffer: JobOffer = {
      ...this.jobOfferForm.value,
      id: this.editingJobOfferId
    };
    this.jobOfferService.updateJobOffer(this.editingJobOfferId, updatedJobOffer).subscribe({
      next: (updatedJobOffer) => {
        const index = this.jobOffers.findIndex(t => t.id === this.editingJobOfferId);
        if (index !== -1) {
          this.jobOffers[index] = updatedJobOffer;
        }
        this.resetForm();
        this.errorMessage = null;
        this.successMessage = 'Offre d’emploi mise à jour avec succès !';
        this.sweetAlertService.showSuccess(this.successMessage);
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de la mise à jour de l’offre : ' + (error.message || error);
        this.sweetAlertService.showError(this.errorMessage);
        console.error('Erreur lors de la mise à jour de l’offre:', error);
      },
    });
  }

  deleteJobOffer(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette offre ?')) {
      this.jobOfferService.deleteJobOffer(id).subscribe({
        next: () => {
          this.jobOffers = this.jobOffers.filter(t => t.id !== id);
          this.errorMessage = null;
          this.successMessage = 'Offre d’emploi supprimée avec succès !';
          this.sweetAlertService.showSuccess(this.successMessage);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression de l’offre : ' + (error.message || error);
          this.sweetAlertService.showError(this.errorMessage);
          console.error('Erreur lors de la suppression de l’offre:', error);
        },
      });
    }
  }

  acceptCandidate(candidateId: number): void {
    console.log(`Tentative d’acceptation du candidat avec l’ID ${candidateId}`);
    this.candidateService.acceptCandidate(candidateId).subscribe({
      next: (updatedCandidate) => {
        this.successMessage = 'Candidat accepté avec succès ! Un email d’acceptation a été envoyé.';
        this.errorMessage = null;
        this.sweetAlertService.showSuccess(this.successMessage);
        console.log(`Candidat avec l'ID ${candidateId} accepté et email envoyé. Réponse :`, updatedCandidate);
        this.loadCandidates();
        if (this.selectedJobOfferId) {
          this.loadSortedCandidates(this.selectedJobOfferId);
        }
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors de l’acceptation du candidat : ' + (error.message || 'Erreur inconnue');
        this.sweetAlertService.showError(this.errorMessage);
        console.error('Détails de l’erreur lors de l’acceptation du candidat :', error);
      }
    });
  }

  rejectCandidate(candidateId: number): void {
    if (confirm('Voulez-vous vraiment rejeter et supprimer ce candidat ?')) {
      this.candidateService.deleteCandidate(candidateId).subscribe({
        next: () => {
          this.candidates = this.candidates.filter(c => c.id !== candidateId);
          this.sortedCandidates = this.sortedCandidates.filter(c => c.id !== candidateId);
          this.errorMessage = null;
          this.successMessage = 'Candidat rejeté et supprimé avec succès !';
          this.sweetAlertService.showSuccess(this.successMessage);
          console.log(`Candidat avec l'ID ${candidateId} supprimé`);
        },
        error: (error) => {
          this.errorMessage = 'Erreur lors de la suppression du candidat : ' + (error.message || error);
          this.sweetAlertService.showError(this.errorMessage);
          console.error('Erreur lors de la suppression du candidat:', error);
        },
      });
    }
  }

  getJobOfferTitle(candidate: Candidate): string {
    const jobOffers = candidate.jobOffers;
    if (jobOffers && jobOffers.length > 0) {
      return jobOffers[0].title || 'Offre non trouvée';
    }
    return 'Aucune offre associée';
  }

  resetForm(): void {
    this.jobOfferForm.reset({
      title: '',
      description: '',
      location: '',
      requirements: '',
      contractType: '',
      salary: '',
      skillsAndExpertise: '',
      workType: ''
    });
    this.isEditing = false;
    this.editingJobOfferId = null;
    this.successMessage = null;
    this.errorMessage = null;
  }

  generateRecruitmentReportPDF(): void {
    const doc = new jsPDF();
    doc.text('Rapport de Recrutement', 10, 10);

    const acceptedCandidates = this.candidates.filter(c => c.status === 'Accepted').length;
    const totalCandidates = this.candidates.length;
    const avgTimeToAccept = this.calculateAverageTimeToAccept();

    doc.text(`Nombre total de candidats : ${totalCandidates}`, 10, 20);
    doc.text(`Candidats acceptés : ${acceptedCandidates}`, 10, 30);
    doc.text(`Délai moyen d’acceptation : ${avgTimeToAccept} jours`, 10, 40);

    let y = 50;
    doc.text('Candidats Acceptés :', 10, y);
    y += 10;
    this.candidates.filter(c => c.status === 'Accepted').forEach((candidate, index) => {
      doc.text(`${index + 1}. ${candidate.firstName} ${candidate.lastName} - ${this.getJobOfferTitle(candidate)}`, 10, y);
      y += 10;
    });

    doc.save('rapport_recrutement.pdf');
    this.sweetAlertService.showSuccess('Rapport PDF généré avec succès !');
  }

  generateRecruitmentReportExcel(): void {
    const reportData = [
      ['Rapport de Recrutement', '', ''],
      ['Nombre total de candidats', this.candidates.length, ''],
      ['Candidats acceptés', this.candidates.filter(c => c.status === 'Accepted').length, ''],
      ['Délai moyen d’acceptation', this.calculateAverageTimeToAccept(), 'jours'],
      ['', '', ''],
      ['ID', 'Prénom', 'Nom', 'Email', 'Genre', 'Offre Associée', 'Statut', 'Score']
    ];

    this.candidates.forEach(candidate => {
      reportData.push([
        candidate.id || '',
        candidate.firstName || '',
        candidate.lastName || '',
        candidate.email || '',
        candidate.gender || '',
        this.getJobOfferTitle(candidate),
        candidate.status || 'Pending',
        candidate.score ? (candidate.score * 100).toFixed(2) + '%' : 'N/A'
      ]);
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(reportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recrutement');
    XLSX.writeFile(wb, 'rapport_recrutement.xlsx');
    this.sweetAlertService.showSuccess('Rapport Excel généré avec succès !');
  }

  private calculateAverageTimeToAccept(): number {
    const acceptedCandidates = this.candidates.filter(c => c.status === 'Accepted');
    if (acceptedCandidates.length === 0) return 0;

    const totalDays = acceptedCandidates.reduce((sum, candidate) => {
      const applicationDate = new Date(candidate.applicationDate || Date.now());
      const acceptDate = new Date(candidate.acceptDate || Date.now());
      const diffTime = acceptDate.getTime() - applicationDate.getTime();
      return sum + (diffTime / (1000 * 60 * 60 * 24));
    }, 0);

    return Math.round(totalDays / acceptedCandidates.length);
  }
}

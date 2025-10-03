import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TrainingService, Training } from '@/app/services/training.service';
import { KeycloakService } from 'keycloak-angular';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import { ChatbotAlaService, ChatResponse } from '@/app/services/chatbotAla.service';

@Component({
  selector: 'app-trainings-employee',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trainings-employee.component.html',
  styleUrls: ['./trainings-employee.component.scss']
})
export class TrainingsEmployeeComponent implements OnInit {
  trainings: Training[] = [];
  selectedTraining: Training | null = null;
  errorMessage: string | null = null;
  showChatbotModal: boolean = false; // Controls chatbot modal visibility
  chatbotQuery: string = ''; // User input for chatbot query
  chatbotMode: string = 'e'; // Default to text input ('e' for text, 'p' for voice)
  chatbotResponse: string = ''; // Chatbot response
  chatbotLastQuery: string = ''; // Last query sent

  constructor(
    private trainingService: TrainingService,
    private keycloakService: KeycloakService,
    private sweetAlertService: SweetAlertService,
    private chatbotService: ChatbotAlaService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        this.errorMessage = 'Veuillez vous connecter pour voir les formations.';
        this.sweetAlertService.showError(this.errorMessage);
        this.keycloakService.login();
        return;
      }
      this.loadTrainings();
    } catch (err) {
      this.errorMessage = 'Erreur lors du chargement : ' + (err instanceof Error ? err.message : String(err));
      this.sweetAlertService.showError(this.errorMessage);
    }
  }

  loadTrainings(): void {
    this.trainingService.getAllTrainings().subscribe({
      next: (data) => {
        this.trainings = Array.isArray(data) ? data : [];
        this.errorMessage = null;
      },
      error: (error) => {
        this.errorMessage = error instanceof Error ? error.message : String(error);
        this.sweetAlertService.showError(this.errorMessage);
      }
    });
  }

  selectTraining(training: Training): void {
    this.selectedTraining = training;
  }

  closeDetails(): void {
    this.selectedTraining = null;
  }

  accessTraining(training: Training): void {
    this.sweetAlertService.showSuccess(`Accès à la formation "${training.trainingName}" demandé avec succès !`);
  }

  // Open the chatbot modal
  openChatbotModal(): void {
    this.showChatbotModal = true;
    this.chatbotQuery = '';
    this.chatbotResponse = '';
    this.chatbotLastQuery = '';
    this.chatbotMode = 'e';
  }

  // Close the chatbot modal
  closeChatbotModal(): void {
    this.showChatbotModal = false;
  }

  // Set chatbot mode ('p' for voice, 'e' for text)
  setChatbotMode(mode: string): void {
    this.chatbotMode = mode;
  }

  // Send query to chatbot
  sendChatbotQuery(): void {
    if (this.chatbotMode === 'e' && !this.chatbotQuery.trim()) {
      this.sweetAlertService.showError('Veuillez entrer une question.');
      return;
    }

    this.chatbotService.sendQuery(this.chatbotQuery, this.chatbotMode).subscribe({
      next: (data: ChatResponse) => {
        this.chatbotResponse = data.response;
        this.chatbotLastQuery = data.query;
        this.sweetAlertService.showSuccess('Réponse reçue !');
      },
      error: (error) => {
        this.chatbotResponse = 'Erreur lors de la communication avec le chatbot.';
        this.sweetAlertService.showError(error.message);
      }
    });
  }
}

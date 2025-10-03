import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { SurveyService } from '@/app/services/survey.service';
import { SurveyDTO, SurveyType, CreateSurveyRequest, SurveyResponse, Question, ContractClientDTO, MeetingResponseDTO, ProjectResponseDTO, TicketResponseDTO, GamificationInfo } from '@core/models/survey.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-survey',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgbPaginationModule
  ],
  templateUrl: './client-component.component.html',
  styleUrls: ['./client-component.component.scss']
})
export class ClientComponentComponent implements OnInit {
  contracts: ContractClientDTO[] = [];
  meetings: MeetingResponseDTO[] = [];
  projects: ProjectResponseDTO[] = [];
  tickets: TicketResponseDTO[] = [];
  surveys: SurveyDTO[] = [];
  gamificationInfo: GamificationInfo | null = null;
  SurveyType = SurveyType;

  // Displayed (paginated) data
  displayedContracts: ContractClientDTO[] = [];
  displayedMeetings: MeetingResponseDTO[] = [];
  displayedProjects: ProjectResponseDTO[] = [];
  displayedTickets: TicketResponseDTO[] = [];
  displayedSurveys: SurveyDTO[] = [];

  // Pagination properties
  ticketsPage = 1;
  ticketsPageSize = 2;
  ticketsCollectionSize = 0;
  meetingsPage = 1;
  meetingsPageSize = 2;
  meetingsCollectionSize = 0;
  projectsPage = 1;
  projectsPageSize = 2;
  projectsCollectionSize = 0;
  contractsPage = 1;
  contractsPageSize = 2;
  contractsCollectionSize = 0;
  surveysPage = 1;
  surveysPageSize = 2;
  surveysCollectionSize = 0;

  private ticketQuestions: Question[] = [
    { id: 7, text: "How satisfied are you with the speed of ticket resolution?" },
    { id: 8, text: "How effective was the solution provided for the ticket?" },
    { id: 9, text: "How clear was the communication during ticket resolution?" },
    { id: 19, text: "How satisfied are you with the support team's responsiveness?" },
    { id: 20, text: "How well was the issue explained to you?" },
    { id: 21, text: "Please provide suggestions to improve ticket handling." }
  ];

  private meetingQuestions: Question[] = [
    { id: 1, text: "How clear was the communication during the meeting?" },
    { id: 2, text: "How useful was the meeting in addressing your concerns?" },
    { id: 3, text: "How satisfied are you with the meeting duration?" },
    { id: 13, text: "How engaged were the participants during the meeting?" },
    { id: 14, text: "How well were action items assigned and clarified?" },
    { id: 15, text: "Please provide any additional feedback about the meeting." }
  ];

  private projectQuestions: Question[] = [
    { id: 4, text: "How satisfied are you with the project delivery quality?" },
    { id: 5, text: "How well did the project meet your expectations?" },
    { id: 6, text: "How satisfied are you with the project timeline adherence?" },
    { id: 16, text: "How effective was the collaboration with the project team?" },
    { id: 17, text: "How satisfied are you with the project documentation provided?" },
    { id: 18, text: "Please describe any challenges faced during the project." }
  ];

  private contractQuestions: Question[] = [
    { id: 10, text: "How clear are the terms of the contract?" },
    { id: 11, text: "How satisfied are you with the contract's value for money?" },
    { id: 12, text: "How well does the contract meet your business needs?" },
    { id: 22, text: "How satisfied are you with the contract negotiation process?" },
    { id: 23, text: "How confident are you in the contract's long-term benefits?" },
    { id: 24, text: "Please share any concerns or suggestions about the contract." }
  ];

  satisfactionOptions = [
    { label: '😊', value: '5', color: 'bg-green-500' },
    { label: '🙂', value: '4', color: 'bg-lime-500' },
    { label: '😐', value: '3', color: 'bg-gray-500' },
    { label: '☹️', value: '2', color: 'bg-orange-500' },
    { label: '😞', value: '1', color: 'bg-red-500' }
  ];

  constructor(private surveyService: SurveyService) {}

  async ngOnInit(): Promise<void> {
    await this.loadContracts();
    await this.loadMeetings();
    await this.loadProjects();
    await this.loadTickets();
    await this.loadSurveys();
    await this.loadGamificationInfo();
  }

  async loadContracts(): Promise<void> {
    try {
      const contractsObservable = await this.surveyService.getContractsForCurrentUser();
      contractsObservable.subscribe({
        next: (data: ContractClientDTO[]) => {
          this.contracts = data;
          this.contractsCollectionSize = this.contracts.length;
          this.refreshContracts();
          console.log('Contracts loaded:', this.contracts);
        },
        error: (error: unknown) => {
          console.error('Error loading contracts:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load contracts!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating loadContracts:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  async loadMeetings(): Promise<void> {
    try {
      const meetingsObservable = await this.surveyService.getMeetingsForCurrentUser();
      meetingsObservable.subscribe({
        next: (data: MeetingResponseDTO[]) => {
          this.meetings = data;
          this.meetingsCollectionSize = this.meetings.length;
          this.refreshMeetings();
          console.log('Meetings loaded:', this.meetings);
        },
        error: (error: unknown) => {
          console.error('Error loading meetings:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load meetings!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating loadMeetings:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  async loadProjects(): Promise<void> {
    try {
      const projectsObservable = await this.surveyService.getProjectsForCurrentUser();
      projectsObservable.subscribe({
        next: (data: ProjectResponseDTO[]) => {
          this.projects = data;
          this.projectsCollectionSize = this.projects.length;
          this.refreshProjects();
          console.log('Projects loaded:', this.projects);
        },
        error: (error: unknown) => {
          console.error('Error loading projects:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load projects!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating loadProjects:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  async loadTickets(): Promise<void> {
    try {
      const ticketsObservable = await this.surveyService.getTicketsForCurrentUser();
      ticketsObservable.subscribe({
        next: (data: TicketResponseDTO[]) => {
          this.tickets = data;
          this.ticketsCollectionSize = this.tickets.length;
          this.refreshTickets();
          console.log('Tickets loaded:', this.tickets);
        },
        error: (error: unknown) => {
          console.error('Error loading tickets:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load tickets!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating loadTickets:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  async loadSurveys(): Promise<void> {
    try {
      const surveysObservable = await this.surveyService.getSurveysForCurrentUser();
      surveysObservable.subscribe({
        next: (data: SurveyDTO[]) => {
          this.surveys = data;
          this.surveysCollectionSize = this.surveys.length;
          this.refreshSurveys();
          console.log('Surveys loaded:', this.surveys);
        },
        error: (error: unknown) => {
          console.error('Error loading surveys:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load surveys!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating loadSurveys:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  async loadGamificationInfo(): Promise<void> {
    try {
      const gamificationObservable = await this.surveyService.getGamificationInfo();
      gamificationObservable.subscribe({
        next: (data: GamificationInfo) => {
          this.gamificationInfo = data;
          console.log('Gamification info loaded:', this.gamificationInfo);
        },
        error: (error: unknown) => {
          console.error('Error loading gamification info:', error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to load gamification info!', confirmButtonColor: '#5156be' });
        }
      });
    } catch (error) {
      console.error('Error initiating loadGamificationInfo:', error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred!', confirmButtonColor: '#5156be' });
    }
  }

  // Method to extract meeting title from meetingLink
  getMeetingTitle(meeting: MeetingResponseDTO): string {
    const linkField = (meeting as any).meetingLink; // Assuming meetingLink exists; adjust if the field name differs
    if (!linkField) {
      return `Meeting #${meeting.meetingid}`; // Fallback if no link is available
    }
    const linkPart = linkField.replace('https://meet.jit.si/', '');
    const titlePart = linkPart.split('-')[0] || `Meeting #${meeting.meetingid}`;
    return titlePart;
  }

  // Refresh methods for pagination
  refreshTickets(): void {
    this.displayedTickets = this.tickets.slice(
      (this.ticketsPage - 1) * this.ticketsPageSize,
      (this.ticketsPage - 1) * this.ticketsPageSize + this.ticketsPageSize
    );
  }

  refreshMeetings(): void {
    this.displayedMeetings = this.meetings.slice(
      (this.meetingsPage - 1) * this.meetingsPageSize,
      (this.meetingsPage - 1) * this.meetingsPageSize + this.meetingsPageSize
    );
  }

  refreshProjects(): void {
    this.displayedProjects = this.projects.slice(
      (this.projectsPage - 1) * this.projectsPageSize,
      (this.projectsPage - 1) * this.projectsPageSize + this.projectsPageSize
    );
  }

  refreshContracts(): void {
    this.displayedContracts = this.contracts.slice(
      (this.contractsPage - 1) * this.contractsPageSize,
      (this.contractsPage - 1) * this.contractsPageSize + this.contractsPageSize
    );
  }

  refreshSurveys(): void {
    this.displayedSurveys = this.surveys.slice(
      (this.surveysPage - 1) * this.surveysPageSize,
      (this.surveysPage - 1) * this.surveysPageSize + this.surveysPageSize
    );
  }

  async submitSurveyForItem(type: SurveyType, itemId: number): Promise<void> {
    // Ensure all data is loaded before proceeding
    if (!this.tickets.length || !this.meetings.length || !this.projects.length || !this.contracts.length) {
      await this.loadTickets();
      await this.loadMeetings();
      await this.loadProjects();
      await this.loadContracts();
    }

    let questions: Question[] = [];
    let itemName = '';
    let itemTitle = '';
    switch (type) {
      case SurveyType.TICKET:
        questions = this.ticketQuestions;
        itemName = 'Ticket';
        const ticket = this.tickets.find(t => t.id === itemId);
        itemTitle = ticket ? ticket.title : `Unknown Ticket #${itemId}`;
        break;
      case SurveyType.MEETING:
        questions = this.meetingQuestions;
        itemName = 'Meeting';
        const meeting = this.meetings.find(m => m.meetingid === itemId);
        itemTitle = meeting ? this.getMeetingTitle(meeting) : `Unknown Meeting #${itemId}`;
        break;
      case SurveyType.PROJECT:
        questions = this.projectQuestions;
        itemName = 'Project';
        const project = this.projects.find(p => p.idProjet === itemId);
        itemTitle = project ? project.name : `Unknown Project #${itemId}`;
        break;
      case SurveyType.CONTRACT:
        questions = this.contractQuestions;
        itemName = 'Contract';
        const contract = this.contracts.find(c => c.id === itemId);
        itemTitle = contract ? contract.title : `Unknown Contract #${itemId}`;
        break;
    }

    const questionsHtml = questions.map((question, i) => `
      <div class="mb-4">
        <label class="block text-gray-700 font-medium mb-2">${question.text}</label>
        <div class="flex space-x-4">
          ${this.satisfactionOptions.map(option => `
            <label class="inline-flex items-center">
              <input type="radio" name="question-${i}" value="${option.value}" class="form-radio h-5 w-5 mr-2" required />
              <span class="text-2xl">${option.label}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `).join('');

    const result = await Swal.fire({
      title: `Submit Survey for ${itemName}`,
      html: `
        <form id="surveyForm">
          ${questionsHtml}
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Additional Feedback (Optional)</label>
            <textarea id="feedback" class="form-control w-full p-2 border rounded" rows="3" placeholder="Your feedback..."></textarea>
          </div>
        </form>
      `,
      width: '800px',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        const responses: SurveyResponse[] = [];
        let hasError = false;

        questions.forEach((question, i) => {
          const answer = (document.querySelector(`input[name="question-${i}"]:checked`) as HTMLInputElement)?.value;
          if (!answer) {
            hasError = true;
            Swal.showValidationMessage(`Please select an option for: "${question.text}"`);
            return;
          }
          const answerNum = parseInt(answer, 10);
          if (answerNum < 1 || answerNum > 5) {
            hasError = true;
            Swal.showValidationMessage(`Invalid value for: "${question.text}". Please select a value between 1 and 5.`);
            return;
          }
          responses.push({ questionId: question.id, answer });
        });

        const feedback = (document.getElementById('feedback') as HTMLTextAreaElement)?.value || undefined;

        if (hasError) return false;
        return { responses, feedback };
      },
      allowOutsideClick: () => !Swal.isLoading(),
      customClass: {
        popup: 'swal-wide'
      }
    });

    if (result.isConfirmed) {
      const { responses, feedback } = result.value;
      if (!responses) return;

      const request: CreateSurveyRequest = {
        title: `Survey for ${itemName} ${itemTitle}`,
        type: type,
        contractClientId: type === SurveyType.CONTRACT ? itemId : undefined,
        meetingId: type === SurveyType.MEETING ? itemId : undefined,
        projectId: type === SurveyType.PROJECT ? itemId : undefined,
        ticketId: type === SurveyType.TICKET ? itemId : undefined,
        responses: responses,
        feedback: feedback
      };

      console.log('Submitting survey request:', JSON.stringify(request, null, 2));

      try {
        const surveyObservable = await this.surveyService.createAndSubmitSurvey(request);
        surveyObservable.subscribe({
          next: (response: SurveyDTO) => {
            console.log('Survey submitted:', response);
            this.surveys.push(response);
            this.surveysCollectionSize = this.surveys.length;
            this.refreshSurveys();
            this.loadGamificationInfo();
            Swal.fire({ icon: 'success', title: 'Success', text: 'Survey submitted successfully!', confirmButtonColor: '#5156be' });
          },
          error: (error: { error?: { message: string } }) => {
            console.error('Error submitting survey:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: error.error?.message || 'Failed to submit survey!', confirmButtonColor: '#5156be' });
          }
        });
      } catch (error) {
        console.error('Error initiating survey submission:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'An unexpected error occurred during submission!', confirmButtonColor: '#5156be' });
      }
    }
  }
}

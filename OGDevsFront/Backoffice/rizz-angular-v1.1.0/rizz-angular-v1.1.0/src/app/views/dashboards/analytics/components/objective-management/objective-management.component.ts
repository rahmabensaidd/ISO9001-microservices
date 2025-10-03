import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { ObjectiveService } from '@/app/services/objective.service';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import { NotificationService } from '@/app/services/notifications.service';
import { NotificationComponent } from '@/app/views/dashboards/analytics/components/notifications/notifications.component';
import { ObjectiveDTO } from '@core/models/process.model';
import { AxeOptions } from '@core/models/process.model';
import { Router } from "@angular/router";

interface ChatMessage {
  sender: 'user' | 'ai';
  text?: string;
  freeformResponse?: string;
  error?: string;
}

interface AxeData {
  image: string;
  category: string;
  date: string;
  title: string;
  content: string;
}

@Component({
  selector: 'app-objective-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './objective-management.component.html',
  styleUrls: ['./objective-management.component.scss'],
})
export class ObjectiveManagementComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('objectiveModal') objectiveModal!: any;
  @ViewChild('chatbotModal') chatbotModal!: any;
  @ViewChild(NotificationComponent) notificationComponent!: NotificationComponent;
  @ViewChild('chatBody') chatBody!: ElementRef;

  objectives: ObjectiveDTO[] = [];
  objectiveForm!: FormGroup;
  submitted = false;
  loading = false;
  isNotificationComponentReady = false;
  axeOptions = AxeOptions; // e.g., ['QUALITY', 'Quality_Management_01', 'STRATEGIC', 'OPERATIONAL', 'FINANCIAL']

  query: string = '';
  conversation: ChatMessage[] = [];
  errorMessage: string = '';
  isChatbotOpen: boolean = false;
  private modalRef: NgbModalRef | null = null;

  axesData: AxeData[] = [
    {
      image: 'assets/images/strategyy.png',
      category: 'Axe',
      date: 'May 05, 2025',
      title: 'Strategic Objectives',
      content: 'Focuses on long-term goals and overarching plans that align with the organization\'s vision and mission.'
    },
    {
      image: 'assets/images/operating.jpg',
      category: 'Axe',
      date: 'May 05, 2025',
      title: 'Operational Objectives',
      content: 'Targets the efficiency and effectiveness of day-to-day processes to streamline workflows.'
    },
    {
      image: 'assets/images/finance.jpg',
      category: 'Axe',
      date: 'May 05, 2025',
      title: 'Financial Objectives',
      content: 'Emphasizes fiscal health, focusing on budgeting, cost management, and revenue growth.'
    },
    {
      image: 'assets/images/quality.jpg',
      category: 'Axe',
      date: 'May 05, 2025',
      title: 'Quality Objectives',
      content: 'Dedicated to maintaining high standards for products, services, and processes.'
    }
  ];

  constructor(
    private objectiveService: ObjectiveService,
    private sweetAlertService: SweetAlertService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadObjectives();
  }

  ngAfterViewInit(): void {
    if (this.notificationComponent) {
      this.isNotificationComponentReady = true;
    }
  }

  navigateToWorkflow() {
    this.router.navigate(['/dashboard/process']);
  }

  ngAfterViewChecked(): void {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

  private initForms(): void {
    this.objectiveForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      axe: ['', Validators.required],
    });
  }

  async addObjective(): Promise<void> {
    this.submitted = true;
    if (this.objectiveForm.invalid) {
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }

    const formValue = this.objectiveForm.value;
    const objective: ObjectiveDTO = {
      title: formValue.title,
      axe: formValue.axe,
    };

    try {
      console.log('Sending objective:', objective);
      const addedObservable = await this.objectiveService.addObjective(objective);
      const added = await lastValueFrom(addedObservable);
      this.objectives.push(added);
      this.modalService.dismissAll();
      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          `Objective "${added.title}" added successfully!`,
          'success',
          'objective',
          added.idObjective
        );
      }
      this.sweetAlertService.showSuccess('Objective added successfully!');
    } catch (error: any) {
      console.error('❌ Error adding objective:', error);
      let errorMsg = error.message || 'Unknown error';
      if (error.message.includes('User not logged in')) {
        errorMsg = 'Authentication required. Please log in.';
      } else if (error.message.includes('401')) {
        errorMsg = 'Unauthorized access. Please log in again.';
      }
      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          `Failed to add objective: ${errorMsg}`,
          'error',
          'objective'
        );
      }
      this.sweetAlertService.showError(`Failed to add objective: ${errorMsg}`);
    }
  }

  async deleteObjective(id: number, title: string): Promise<void> {
    const confirmed = await this.sweetAlertService.showConfirm(
      `Are you sure you want to delete "${title}"?`,
      'This action cannot be undone.'
    );
    if (!confirmed) {
      return;
    }

    this.loading = true;
    try {
      const deleteObservable = await this.objectiveService.deleteObjective(id);
      await lastValueFrom(deleteObservable);
      this.objectives = this.objectives.filter((obj) => obj.idObjective !== id);
      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          `Objective "${title}" deleted successfully!`,
          'success',
          'objective',
          id
        );
      }
      this.sweetAlertService.showSuccess('Objective deleted successfully!');
    } catch (error: any) {
      console.error('❌ Error deleting objective:', error);
      let errorMsg = error.message || 'Unknown error';
      if (error.message.includes('User not logged in')) {
        errorMsg = 'Authentication required. Please log in.';
      } else if (error.message.includes('401')) {
        errorMsg = 'Unauthorized access. Please log in again.';
      } else if (error.message.includes('404')) {
        errorMsg = `Objective with ID ${id} not found`;
      }
      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          `Failed to delete objective: ${errorMsg}`,
          'error',
          'objective'
        );
      }
      this.sweetAlertService.showError(`Failed to delete objective: ${errorMsg}`);
    } finally {
      this.loading = false;
    }
  }

  async loadObjectives(): Promise<void> {
    this.loading = true;
    try {
      const objectivesObservable = await this.objectiveService.getAllObjectives();
      this.objectives = await lastValueFrom(objectivesObservable);
      console.log('✅ Objectives loaded:', this.objectives);
      if (this.objectives.length === 0) {
        this.sweetAlertService.showWarning('No objectives found.');
      }
    } catch (error: any) {
      console.error('❌ Error loading objectives:', error);
      let errorMsg = error.message || 'Unknown error';
      if (error.message.includes('User not logged in')) {
        errorMsg = 'Authentication required. Please log in.';
      } else if (error.message.includes('401')) {
        errorMsg = 'Unauthorized access. Please log in again.';
      }
      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          `Failed to load objectives: ${errorMsg}`,
          'error',
          'objective'
        );
      }
      this.sweetAlertService.showError(`Failed to load objectives: ${errorMsg}`);
    } finally {
      this.loading = false;
    }
  }

  openAddModal(): void {
    this.submitted = false;
    this.objectiveForm.reset({
      title: '',
      axe: '',
    });
    this.modalService.open(this.objectiveModal, { centered: true });
  }

  toggleChatbotModal(): void {
    if (this.isChatbotOpen && this.modalRef) {
      this.modalRef.dismiss('Close click');
      this.isChatbotOpen = false;
      this.modalRef = null;
    } else {
      this.query = '';
      this.conversation = [];
      this.errorMessage = '';
      this.modalRef = this.modalService.open(this.chatbotModal, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg',
        windowClass: 'chatbot-modal',
      });
      this.isChatbotOpen = true;
      this.modalRef.result.finally(() => {
        this.isChatbotOpen = false;
        this.modalRef = null;
      });
    }
  }

  async sendQuery(): Promise<void> {
    if (!this.query.trim()) {
      this.errorMessage = 'Query cannot be empty';
      this.conversation.push({ sender: 'ai', error: this.errorMessage });
      return;
    }

    this.conversation.push({ sender: 'user', text: this.query });
    this.loading = true;
    this.errorMessage = '';

    try {
      this.conversation.push({
        sender: 'ai',
        freeformResponse: 'Chatbot functionality for objectives is not implemented yet.',
      });
      this.query = '';
    } catch (error: any) {
      console.error('Chatbot error:', error);
      this.errorMessage = error.message || 'Failed to process query';
      this.conversation.push({ sender: 'ai', error: this.errorMessage });
    } finally {
      this.loading = false;
    }
  }

  clear(): void {
    this.query = '';
    this.conversation = [];
    this.errorMessage = '';
  }
}

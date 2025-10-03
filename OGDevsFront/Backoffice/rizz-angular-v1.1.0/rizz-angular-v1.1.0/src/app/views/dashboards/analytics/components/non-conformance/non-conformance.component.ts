import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom, Observable } from 'rxjs';
import { NonConformityService } from '@/app/services/non-conformity.service';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import { ProcessService } from '@/app/services/process-service.service';
import { ChatbotService, ChatbotResponse } from '@/app/services/chatbot.service';
import { NotificationService } from '@/app/services/notifications.service';
import { NonConformityDTO } from '@core/models/nonconformance.model';
import { IndicatorDTO } from '@/app/services/indicator.model';
import { NotificationComponent } from '@/app/views/dashboards/analytics/components/notifications/notifications.component';
import {JustGageDirective} from "@core/directive/justgage.directive";

interface ChatMessage {
  sender: 'user' | 'ai';
  text?: string;
  response?: ChatbotResponse; // For structured responses
  freeformResponse?: string; // For freeform responses
  error?: string;
}

@Component({
  selector: 'app-non-conformance',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NotificationComponent , JustGageDirective],
  templateUrl: './non-conformance.component.html',
  styleUrls: ['./non-conformance.component.scss'],
})
export class NonConformanceComponent implements OnInit, AfterViewInit, AfterViewChecked {
  @ViewChild('addNonConformanceModal') addNonConformanceModal: any;
  @ViewChild('fixNonConformityModal') fixNonConformityModal: any;
  @ViewChild('chatbotModal') chatbotModal: any;
  @ViewChild(NotificationComponent) notificationComponent!: NotificationComponent;
  @ViewChild('chatBody') chatBody!: ElementRef;

  nonConformities: NonConformityDTO[] = [];
  indicators: IndicatorDTO[] = [];
  hasIndMag02: boolean = false; // Add this property
  hasIndMag01: boolean = false; // Add this property
  nonConformanceForm!: FormGroup;
  fixNonConformityForm!: FormGroup;
  selectedFiles: File[] = [];
  currentNonConformity: NonConformityDTO | null = null;
  selectedNonConformity: NonConformityDTO | null = null;
  submitted = false;
  loading = false;
  isNotificationComponentReady = false;

  // Chatbot properties
  query: string = '';
  conversation: ChatMessage[] = [];
  errorMessage: string = '';
  isChatbotOpen: boolean = false;
  private modalRef: NgbModalRef | null = null;

  constructor(
    private chatbotService: ChatbotService,
    private processServ: ProcessService,
    private router: Router,
    private conformityService: NonConformityService,
    private sweetAlertService: SweetAlertService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private notificationService: NotificationService
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadNonConformities();
    this.loadIndicators();
  }

  ngAfterViewInit(): void {
    if (this.notificationComponent) {
      this.isNotificationComponentReady = true;
    }
  }

  ngAfterViewChecked(): void {
    if (this.chatBody) {
      this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
    }
  }

  private initForms(): void {
    this.nonConformanceForm = this.fb.group({
      source: ['', Validators.required],
      description: ['', Validators.required],
      dateCreated: [new Date().toISOString().split('T')[0], Validators.required],
      type: ['', Validators.required],
      indicatorId: [null, Validators.required],
      status: ['OPEN', Validators.required],
    });

    this.fixNonConformityForm = this.fb.group({
      actionTaken: ['', [Validators.required, Validators.minLength(1)]],
      fixDate: [new Date().toISOString().split('T')[0], [Validators.required, Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      isEffective: [false],
    });
  }

  async loadIndicators(): Promise<void> {
    this.loading = true;
    try {
      const indicatorsObservable = await this.processServ.getAllIndicators();
      this.indicators = await lastValueFrom(indicatorsObservable);
      this.hasIndMag01 = this.indicators.some(indicator => indicator.code === 'IND-MAG-01'); // Compute hasIndMag01
      this.hasIndMag02 = this.indicators.some(indicator => indicator.code === 'IND-MAG-02'); // Compute hasIndMag02
      console.log('✅ Indicators loaded:', this.indicators);
      if (this.indicators.length === 0) {
        this.sweetAlertService.showError('No indicators available. Please add indicators first.');
      }
    } catch (error: any) {
      console.error('❌ Error loading indicators:', error);
      this.sweetAlertService.showError(`Failed to load indicators: ${error.message || 'Unknown error'}`);
    } finally {
      this.loading = false;
    }
  }

  async loadNonConformities(): Promise<void> {
    this.loading = true;
    try {
      const nonConformitiesObservable = await this.conformityService.getAllNonConformities();
      const nonConformities = await lastValueFrom(nonConformitiesObservable);

      this.nonConformities = nonConformities.map((nc) => {
        if (nc.indicatorId) {
          const matchingIndicator = this.indicators.find((i) => i.idIndicateur === nc.indicatorId);
          if (matchingIndicator) {
            nc.indicator = {
              idIndicateur: matchingIndicator.idIndicateur,
              code: matchingIndicator.code,
              libelle: matchingIndicator.libelle,
              unite: matchingIndicator.unite,
              description: matchingIndicator.description,
              type: matchingIndicator.type,
              frequence: matchingIndicator.frequence,
              cible: matchingIndicator.cible,
              currentValue: matchingIndicator.currentValue,
              status: matchingIndicator.status,
              lastCalculated: matchingIndicator.lastCalculated,
              actif: matchingIndicator.actif,
              nonConformitiesCount: matchingIndicator.nonConformitiesCount,
            };
          }
        }
        return nc;
      });

      console.log('✅ Non-conformities loaded:', this.nonConformities);
    } catch (error: any) {
      console.error('❌ Error loading non-conformities:', error);
      this.sweetAlertService.showError(`Failed to load non-conformities: ${error.message || 'Unknown error'}`);
    } finally {
      this.loading = false;
    }
  }

  openAddModal(): void {
    if (this.indicators.length === 0) {
      this.sweetAlertService.showError('Cannot add non-conformance: No indicators available.');
      return;
    }
    this.submitted = false;
    this.nonConformanceForm.reset({
      source: '',
      description: '',
      dateCreated: new Date().toISOString().split('T')[0],
      type: '',
      indicatorId: null,
      status: 'OPEN',
    });
    this.modalService.open(this.addNonConformanceModal, { centered: true });
  }

  async addNonConformance(): Promise<void> {
    this.submitted = true;
    if (this.nonConformanceForm.invalid) {
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }

    const formValue = this.nonConformanceForm.value;
    const selectedIndicator = formValue.indicatorId;

    if (!selectedIndicator || !selectedIndicator.idIndicateur) {
      this.sweetAlertService.showError('Please select a valid indicator.');
      return;
    }

    const nonConformance: NonConformityDTO = {
      source: formValue.source,
      description: formValue.description,
      dateCreated: formValue.dateCreated,
      type: formValue.type,
      status: formValue.status,
      indicator: {
        idIndicateur: selectedIndicator.idIndicateur,
        code: selectedIndicator.code,
        libelle: selectedIndicator.libelle,
        unite: selectedIndicator.unite,
        description: selectedIndicator.description,
        type: selectedIndicator.type,
        frequence: selectedIndicator.frequence,
        cible: selectedIndicator.cible,
        currentValue: selectedIndicator.currentValue,
        status: selectedIndicator.status,
        lastCalculated: selectedIndicator.lastCalculated,
        actif: selectedIndicator.actif,
        nonConformitiesCount: selectedIndicator.nonConformitiesCount,
      },
    };

    try {
      console.log('Sending non-conformance:', nonConformance);
      const addedObservable = await this.conformityService.addNonConformance(nonConformance, false);
      const added = await lastValueFrom(addedObservable);
      const matchingIndicator = this.indicators.find((i) => i.idIndicateur === added.indicatorId);
      if (matchingIndicator) {
        added.indicator = matchingIndicator;
      }
      this.nonConformities.push(added);
      this.modalService.dismissAll();

      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          'New non-conformity added! Click to view and fix.',
          'info',
          'non-conformity', // Fixed: Added notificationType
          added.idNonConformity // Fixed: Moved id to fourth argument
        );
      } else {
        console.warn('NotificationComponent not ready yet');
      }

      this.loadNonConformities();
    } catch (error: any) {
      console.error('❌ Error adding non-conformance:', error);
      this.notificationService.showNotification('Failed to add non-conformance', 'error');
      this.sweetAlertService.showError(`Failed to add non-conformance: ${error.message || 'Unknown error'}`);
    }
  }

  async submitFixForm(): Promise<void> {
    this.submitted = true;
    if (this.fixNonConformityForm.invalid || !this.currentNonConformity) {
      console.error('Form invalid:', this.fixNonConformityForm.value, this.currentNonConformity);
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }

    const formValue = this.fixNonConformityForm.value;
    const id = this.currentNonConformity.idNonConformity!;

    try {
      const fixObservable = await this.conformityService.fixNonConformity(
        id,
        formValue.actionTaken,
        formValue.fixDate,
        formValue.isEffective,
        this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      );
      const result = await lastValueFrom(fixObservable);
      console.log('Fix successful:', result);
      this.modalService.dismissAll();
      this.loadNonConformities();
      this.sweetAlertService.showSuccess('Non-conformity fixed successfully!');
      if (this.isNotificationComponentReady && this.notificationComponent) {
        this.notificationComponent.addNotification(
          `Non-conformity #${id} fixed successfully.`,
          'success',
          'non-conformity', // Fixed: Added notificationType
          id // Fixed: Moved id to fourth argument
        );
      } else {
        console.warn('NotificationComponent not ready yet');
      }
    } catch (error: any) {
      console.error('Fix error:', error);
      this.sweetAlertService.showError(`Failed to fix non-conformity: ${error.message || 'Unknown error'}`);
    }
  }

  openFixModal(nonConformity: NonConformityDTO, modal: any): void {
    this.currentNonConformity = nonConformity;
    this.fixNonConformityForm.reset({
      actionTaken: '',
      fixDate: new Date().toISOString().split('T')[0],
      isEffective: false,
    });
    this.selectedFiles = [];
    this.modalService.open(modal, { size: 'lg' });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }


  async deleteNonConformance(id: number): Promise<void> {
    try {
      const deleteObservable: Observable<void> = await this.conformityService.deleteNonConformance(id);
      await lastValueFrom(deleteObservable);
      this.nonConformities = this.nonConformities.filter((nc) => nc.idNonConformity !== id);
      this.sweetAlertService.showSuccess('Non-conformity deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting non-conformity:', error);
      this.sweetAlertService.showError(`Failed to delete non-conformity: ${error.message || 'Unknown error'}`);
    }
  }

  viewNonConformityDetails(id: number): void {
    this.selectedNonConformity = this.nonConformities.find((nc) => nc.idNonConformity === id) || null;
  }

  backToList(): void {
    this.selectedNonConformity = null;
  }

  navigateToIsoClauses(): void {
    this.router.navigate(['/isoclauses']);
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
        windowClass: 'chatbot-modal'
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
      this.conversation.push({
        sender: 'ai',
        error: this.errorMessage
      });
      return;
    }

    // Add user message to conversation
    this.conversation.push({
      sender: 'user',
      text: this.query
    });

    this.loading = true;
    this.errorMessage = '';

    try {
      // Check if the query is related to non-conformities (simple heuristic for demo)
      const isNonConformityQuery = this.query.toLowerCase().includes('source') ||
        this.query.toLowerCase().includes('type') ||
        this.query.toLowerCase().includes('non-conformity');

      if (isNonConformityQuery) {
        // Use the chatbotService to get a structured response
        const observable = await this.chatbotService.sendQuery(this.query);
        const result = await lastValueFrom(observable);
        console.log('Chatbot structured response:', result);
        this.conversation.push({
          sender: 'ai',
          response: result.error ? undefined : result,
          error: result.error || undefined
        });
      } else {
        // Simulate a freeform response (since chatbotService might not support freeform yet)
        let freeformResponse: string;

        if (this.query.toLowerCase().includes('what is quality management')) {
          freeformResponse = 'Quality management is the process of overseeing all activities and tasks needed to maintain a desired level of excellence. This includes creating and implementing quality planning, assurance, control, and improvement strategies to ensure products or services meet specified requirements and customer expectations.';
        } else if (this.query.toLowerCase().includes('tell me a joke')) {
          freeformResponse = 'Why did the quality manager bring a ladder to the factory? Because they wanted to take production to the next level!';
        } else {
          freeformResponse = 'I’m not sure how to respond to that, but I’d be happy to help with any quality management or non-conformity questions you have. What’s on your mind?';
        }

        this.conversation.push({
          sender: 'ai',
          freeformResponse: freeformResponse
        });
      }

      this.query = ''; // Clear input
    } catch (error: any) {
      console.error('Chatbot error:', error);
      this.errorMessage = error.message || 'Failed to process query';
      this.conversation.push({
        sender: 'ai',
        error: this.errorMessage
      });
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

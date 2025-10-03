import { Component, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuditService } from '@/app/services/audit.service';
import { NotificationService, ProcessNotification } from '@/app/services/NotificationService';
import { Audit } from '@/app/core/models/audit.model';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SweetAlertService } from '@/app/services/sweet-alert.service';

@Component({
  selector: 'app-audit-calendar',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    NgbModalModule,
    FormsModule,
    ReactiveFormsModule,
    FullCalendarModule,
  ],
  templateUrl: './audit-calendar.component.html',
  styleUrls: ['./audit-calendar.component.css'],
})
export class AuditCalendarComponent implements OnInit, OnDestroy {
  audits: Audit[] = [];
  auditForm: FormGroup;
  modifyForm: FormGroup;
  detailForm: FormGroup;
  submitted: boolean = false;
  selectedAuditId?: number;
  notifications: ProcessNotification[] = [];
  private notificationSubscription!: Subscription;

  @ViewChild('detailModal') detailModal!: TemplateRef<any>;
  @ViewChild('modifyAuditModal') modifyAuditModal!: TemplateRef<any>;
  @ViewChild('deleteAuditModal') deleteAuditModal!: TemplateRef<any>;

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin, interactionPlugin],
    events: [],
    eventClick: this.handleEventClick.bind(this),
    editable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek,dayGridDay',
    },
  };
  calendarEvents: EventInput[] = [];

  constructor(
    private auditService: AuditService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private alertService: SweetAlertService
  ) {
    this.auditForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
    this.modifyForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
    });
    this.detailForm = this.fb.group({
      title: [{ value: '', disabled: true }],
      description: [{ value: '', disabled: true }],
      startDate: [{ value: '', disabled: true }],
      endDate: [{ value: '', disabled: true }],
    });
  }

  ngOnInit(): void {
    this.loadAudits();
    this.notificationSubscription = this.notificationService.auditNotifications$.subscribe(
      (notifications) => {
        this.notifications = notifications;
      }
    );
    this.route.queryParams.subscribe((params) => {
      const auditId = params['auditId'];
      if (auditId) {
        this.highlightAudit(auditId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  private showSuccess(message: string): void {
    this.alertService.showSuccess(message);
  }

  private showError(message: string): void {
    this.alertService.showError(message);
  }

  async loadAudits(): Promise<void> {
    try {
      this.auditService.getAudits().subscribe({
        next: (audits: Audit[]) => {
          this.audits = audits;
          this.calendarEvents = audits.map((audit) => ({
            id: audit.id?.toString(),
            title: audit.title,
            start: audit.startDate,
            end: audit.endDate,
            extendedProps: {
              description: audit.description,
              process: audit.process?.procName,
              operation: audit.operation?.operationName,
            },
          }));
          this.calendarOptions.events = this.calendarEvents;
        },
        error: (error) => {
          this.showError(`Échec du chargement des audits: ${error.message || 'Erreur inconnue'}`);
        },
      });
    } catch (error) {
      this.showError('Erreur lors du chargement des audits.');
    }
  }

  highlightAudit(auditId: string): void {
    this.auditService.getAuditById(Number(auditId)).subscribe({
      next: (audit) => {
        this.showSuccess(`Audit sélectionné: ${audit.title}`);
        this.calendarOptions.initialDate = audit.startDate;
        this.loadAudits();
      },
      error: (error) => {
        this.showError(`Erreur lors du chargement de l'audit: ${error.message || 'Erreur inconnue'}`);
      },
    });
  }

  handleEventClick(arg: EventClickArg): void {
    console.log('Event clicked, audit ID:', arg.event.id);
    const auditId = Number(arg.event.id);
    this.auditService.getAuditById(auditId).subscribe({
      next: (audit) => {
        this.openDetailModal(this.detailModal, audit);
      },
      error: (error) => {
        this.showError(`Erreur lors du chargement de l'audit: ${error.message || 'Erreur inconnue'}`);
      },
    });
  }

  openDetailModal(content: TemplateRef<any>, audit: Audit): void {
    this.selectedAuditId = audit.id;
    this.detailForm.patchValue({
      title: audit.title,
      description: audit.description || '',
      startDate: audit.startDate?.split('T')[0],
      endDate: audit.endDate?.split('T')[0],
    });
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'update') {
          this.openModifyAuditModal(this.modifyAuditModal, audit);
        } else if (result === 'delete') {
          this.openDeleteAuditModal(this.deleteAuditModal, audit.id!);
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  openAddAuditModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.auditForm.reset({ title: '', description: '', startDate: '', endDate: '' });
    this.modalService.open(content);
  }

  openModifyAuditModal(content: TemplateRef<any>, audit: Audit): void {
    this.submitted = false;
    this.selectedAuditId = audit.id;
    this.modifyForm.patchValue({
      title: audit.title,
      description: audit.description || '',
      startDate: audit.startDate?.split('T')[0],
      endDate: audit.endDate?.split('T')[0],
    });
    this.modalService.open(content);
  }

  openDeleteAuditModal(content: TemplateRef<any>, id: number): void {
    this.selectedAuditId = id;
    this.modalService.open(content);
  }

  async createAudit(): Promise<void> {
    this.submitted = true;
    if (this.auditForm.valid) {
      const newAudit: Audit = {
        title: this.auditForm.value.title,
        description: this.auditForm.value.description || '',
        startDate: new Date(this.auditForm.value.startDate).toISOString(),
        endDate: new Date(this.auditForm.value.endDate).toISOString(),
      };
      try {
        this.auditService.createAudit(newAudit).subscribe({
          next: (audit: Audit) => {
            this.audits.push(audit);
            this.loadAudits();
            this.modalService.dismissAll();
            this.submitted = false;
            this.showSuccess('Audit créé avec succès !');
          },
          error: (error) => {
            this.showError(`Erreur lors de la création: ${error.message || 'Erreur inconnue'}`);
          },
        });
      } catch (error) {
        this.showError('Erreur lors de la création de l\'audit.');
      }
    } else {
      this.showError('Veuillez remplir tous les champs requis.');
    }
  }

  async modifyAudit(): Promise<void> {
    this.submitted = true;
    if (this.modifyForm.valid && this.selectedAuditId) {
      const updatedAudit: Audit = {
        id: this.selectedAuditId,
        title: this.modifyForm.value.title,
        description: this.modifyForm.value.description || '',
        startDate: new Date(this.modifyForm.value.startDate).toISOString(),
        endDate: new Date(this.modifyForm.value.endDate).toISOString(),
      };
      try {
        this.auditService.updateAudit(this.selectedAuditId, updatedAudit).subscribe({
          next: (audit: Audit) => {
            const index = this.audits.findIndex((a) => a.id === audit.id);
            if (index !== -1) {
              this.audits[index] = audit;
            }
            this.loadAudits();
            this.modalService.dismissAll();
            this.submitted = false;
            this.showSuccess('Audit mis à jour avec succès !');
          },
          error: (error) => {
            this.showError(`Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}`);
          },
        });
      } catch (error) {
        this.showError('Erreur lors de la mise à jour de l\'audit.');
      }
    } else {
      this.showError('Veuillez remplir tous les champs requis.');
    }
  }

  async confirmDeleteAudit(): Promise<void> {
    if (this.selectedAuditId) {
      try {
        this.auditService.deleteAudit(this.selectedAuditId).subscribe({
          next: () => {
            this.audits = this.audits.filter((a) => a.id !== this.selectedAuditId);
            this.loadAudits();
            this.modalService.dismissAll();
            this.showSuccess('Audit supprimé avec succès !');
          },
          error: (error) => {
            this.showError(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
          },
        });
      } catch (error) {
        this.showError('Erreur lors de la suppression de l\'audit.');
      }
    }
  }

  get form() {
    return this.auditForm.controls;
  }

  get modifyFormControls() {
    return this.modifyForm.controls;
  }

  get detailFormControls() {
    return this.detailForm.controls;
  }
}

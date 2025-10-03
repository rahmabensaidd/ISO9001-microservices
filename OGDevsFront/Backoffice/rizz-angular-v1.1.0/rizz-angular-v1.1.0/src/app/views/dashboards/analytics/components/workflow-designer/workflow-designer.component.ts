import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as joint from 'jointjs/dist/joint';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProcessService } from '@/app/services/process-service.service';
import { ChatbotService } from '@/app/services/chatbot.service';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Workflow, Process, Operation, Task, Objective, UserRepresentation, Poste } from '@core/models/process.model';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import { NonConformityService } from '@/app/services/non-conformity.service';
import { IndicatorDTO } from '@/app/services/indicator.model';
import { NonConformityDTO } from '@core/models/nonconformance.model';
import { lastValueFrom } from 'rxjs';
import { Data } from '@/app/core/models/data.model';
import { animate, state, style, transition, trigger } from '@angular/animations';
import {Router} from "@angular/router";

@Component({
  selector: 'app-workflow-designer',
  templateUrl: './workflow-designer.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  styleUrls: ['./workflow-designer.component.css'],
  animations: [
    trigger('popupAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'translate(-50%, -50%) scale(0.8)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1)'
      })),
      transition('void => *', [
        animate('300ms ease-out')
      ]),
      transition('* => void', [
        animate('200ms ease-in')
      ])
    ])
  ]
})
export class WorkflowDesignerComponent implements AfterViewInit {
  @ViewChild('paperContainer', { static: false }) paperContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('addProcessTask', { static: false }) addProcessTask!: any;
  @ViewChild('addOperationModal', { static: false }) addOperationModal!: any;
  @ViewChild('addTaskModal', { static: false }) addTaskModal!: any;
  @ViewChild('addObjectiveModal', { static: false }) addObjectiveModal!: any;
  @ViewChild('workflowNameModal', { static: false }) workflowNameModal!: any;
  @ViewChild('chatbotPopup', { static: false }) chatbotPopup!: ElementRef<HTMLDivElement>;

  private graph!: joint.dia.Graph;
  private paper!: joint.dia.Paper;
  processName = 'process';
  processId = 1;
  workflowNames: { id: number; name: string }[] = [];
  selectedWorkflowName: string | null = null;
  processes: Process[] = [];
  operations: Operation[] = [];
  tasks: Task[] = [];
  users: UserRepresentation[] = [];
  postes: Poste[] = [];
  selectedElement: joint.shapes.standard.Rectangle | joint.shapes.standard.Circle | null = null;
  selectedElementView: joint.dia.ElementView | null = null;
  secondSelectedElement: joint.shapes.standard.Rectangle | joint.shapes.standard.Circle | null = null;
  selectedLink: joint.dia.Link | null = null;

  selectedElementName = '';
  selectedElementColor = '#3498db';
  selectedElementWidth = 120;
  selectedElementHeight = 50;
  selectedElementShape = 'rectangle';
  selectedElementFontFamily = 'Arial';
  selectedElementFontSize = 12;

  processForm!: FormGroup;
  operationForm!: FormGroup;
  objectiveForm!: FormGroup;
  taskForm!: FormGroup;
  workflowNameForm!: FormGroup;
  submitted = false;
  objectives: Objective[] = [];
  operationPostes: Poste[] = [];

  isAssignMode = false;
  selectedObjective: Objective | null = null;
  selectedProcess: Process | null = null;
  indicators: IndicatorDTO[] = [];
  loadingIndicators = false;
  nonConformities: NonConformityDTO[] = [];
  dataList: Data[] = [];
  showSnapshot = false;
  private snapshotContainer!: HTMLElement;
  private loadedSnapshot?: string | null;

  showChatbot = false;
  chatbotQuestion = '';
  chatHistory: { question: string; response: string }[] = [];
  isChatbotLoading = false;
  isVoiceMode = false;
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private initialPopupX = 0;
  private initialPopupY = 0;

  constructor(
    private http: HttpClient,
    private modalService: NgbModal,
    private processService: ProcessService,
    private fb: FormBuilder,
    private sweetAlertService: SweetAlertService,
    private nonconfserv: NonConformityService,
    private chatbotService: ChatbotService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadWorkflowNames();
    this.loadUsersFromKeycloak();
    this.loadPostes();
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    this.initializeWorkflow();
    this.setupPaperEvents();
    this.snapshotContainer = document.getElementById('snapshotContainer') as HTMLElement;
    if (!this.snapshotContainer) {
      console.error('Snapshot container not found in DOM');
    }
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.setupDragging();
  }
  navigateToObjectives() {
    this.router.navigate(['/objective']);
  }
  private setupDragging(): void {
    const popup = this.chatbotPopup?.nativeElement;
    const header = popup?.querySelector('.chatbot-header') as HTMLElement;

    if (!popup || !header) return;

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (event: MouseEvent) => {
      event.preventDefault();
      this.isDragging = true;
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      const rect = popup.getBoundingClientRect();
      this.initialPopupX = rect.left;
      this.initialPopupY = rect.top;

      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    });
  }

  private onMouseMove = (event: MouseEvent): void => {
    if (!this.isDragging) return;

    const popup = this.chatbotPopup?.nativeElement;
    if (!popup) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    const newX = this.initialPopupX + deltaX;
    const newY = this.initialPopupY + deltaY;

    popup.style.left = `${newX}px`;
    popup.style.top = `${newY}px`;
    popup.style.bottom = 'auto';
    popup.style.transform = 'none';
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  private initializeForms(): void {
    this.processForm = this.fb.group({
      id: [null],
      procName: ['', Validators.required],
      creationDate: [null],
      modifDate: [null],
      finishDate: [null],
      x: [0, Validators.required],
      y: [0, Validators.required],
      description: ['', Validators.required],
      pilote: [null, Validators.required],
    });

    this.operationForm = this.fb.group({
      id: [null],
      operationName: ['', Validators.required],
      operationDescription: ['', Validators.required],
      creationDate: [null],
      finishDate: [null],
      postes: [[]],
      x: [0, Validators.required],
      y: [0, Validators.required],
      process: [null],
    });

    this.taskForm = this.fb.group({
      id: [null],
      taskDescription: ['', Validators.required],
      taskStatus: ['', Validators.required],
      creationDate: [null],
      finishDate: [null],
      x: [0, Validators.required],
      y: [0, Validators.required],
      operation: [null],
      dataIds: [[]],
    });

    this.objectiveForm = this.fb.group({
      idObjective: [null],
      title: ['', Validators.required],
      axe: ['', Validators.required],
      process: [null],
    });

    this.workflowNameForm = this.fb.group({
      workflowName: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  private initializeWorkflow(): void {
    if (!this.paperContainer?.nativeElement) {
      console.error('paperContainer is not initialized.');
      this.sweetAlertService.showError('paperContainer is not initialized.');
      return;
    }
    this.graph = new joint.dia.Graph();
    this.paper = new joint.dia.Paper({
      el: this.paperContainer.nativeElement,
      model: this.graph,
      width: '100%',
      height: 600,
      gridSize: 10,
      drawGrid: true,
      background: { color: '#f0f0f0' },
      interactive: true,
    });
  }

  private setupPaperEvents(): void {
    this.paper.on('element:pointerclick', (elementView: joint.dia.ElementView) => {
      const element = elementView.model as joint.shapes.standard.Rectangle | joint.shapes.standard.Circle;
      if (this.isAssignMode) {
        this.handleAssignMode(element, elementView);
      } else {
        this.handleElementSelection(element, elementView);
      }
    });

    this.paper.on('link:pointerclick', (linkView: joint.dia.LinkView) => {
      this.selectedLink = linkView.model;
      this.selectedElement = null;
      this.selectedElementView = null;
      console.log('Selected Link:', this.selectedLink);
    });
  }

  private handleAssignMode(element: joint.shapes.standard.Rectangle | joint.shapes.standard.Circle, elementView: joint.dia.ElementView): void {
    if (!this.selectedElement) {
      this.selectedElement = element;
      this.selectedElementView = elementView;
    } else {
      this.secondSelectedElement = element;
      this.createLink();
    }
  }

  private handleElementSelection(element: joint.shapes.standard.Rectangle | joint.shapes.standard.Circle, elementView: joint.dia.ElementView): void {
    console.log('Element selected:', element);
    this.selectedElement = element;
    this.selectedElementView = elementView;
    this.selectedLink = null;
    this.selectedElementName = element.attr('label/text') || '';
    this.selectedElementColor = element.attr('body/fill') || '#3498db';
    this.selectedElementWidth = element.size().width || 120;
    this.selectedElementHeight = element.size().height || 50;
    this.selectedElementShape = element instanceof joint.shapes.standard.Circle ? 'circle' : 'rectangle';
    this.selectedElementFontFamily = element.attr('label/fontFamily') || 'Arial';
    this.selectedElementFontSize = element.attr('label/fontSize') || 12;

    if (element.prop('elementType') === 'process') {
      const position = element.position();
      const process = this.processes.find(p => p.x === position.x && p.y === position.y);
      if (process) {
        this.onProcessSelected(process);
      }
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Delete' || event.key === 'Suppr') {
      this.deleteLinkOrElement();
    }
  }

  getStatus(indicator: IndicatorDTO): string {
    if (!indicator.currentValue || !indicator.cible) return 'Unknown';

    if (indicator.unite === '%') {
      if (indicator.description.includes('Taux') && !indicator.description.includes('retard') && !indicator.description.includes('frais')) {
        if (indicator.currentValue >= indicator.cible) return 'Meeting Target';
        if (indicator.currentValue >= indicator.cible * 0.9) return 'Close to Target';
        return 'Below Target';
      } else {
        if (indicator.currentValue <= indicator.cible) return 'Meeting Target';
        if (indicator.currentValue <= indicator.cible * 1.1) return 'Close to Target';
        return 'Above Target';
      }
    } else {
      if (indicator.currentValue <= indicator.cible) return 'Meeting Target';
      if (indicator.currentValue <= indicator.cible + 1) return 'Close to Target';
      return 'Above Target';
    }
  }

  getStatusClass(indicator: IndicatorDTO): string {
    const status = this.getStatus(indicator);
    return status === 'Meeting Target' ? 'success' : status === 'Close to Target' ? 'warning' : 'danger';
  }

  getNonConformitiesCount(indicator: IndicatorDTO): number {
    return indicator.nonConformitiesCount || 0;
  }

  async onProcessSelected(process: Process): Promise<void> {
    this.selectedProcess = process;
    if (!process.id) {
      console.warn('⚠️ Process does not have an ID yet.');
      this.sweetAlertService.showError('Cannot load indicators: Save the process first.');
      this.indicators = [];
      return;
    }
    await this.loadIndicators(process.id);
  }

  async refreshIndicators(): Promise<void> {
    if (!this.selectedProcess?.id) {
      this.sweetAlertService.showError('Cannot refresh indicators: No process selected or unsaved.');
      return;
    }
    this.loadingIndicators = true;
    try {
      const indicatorCodes = this.indicators.map(ind => ind.code);
      const updatePromises = indicatorCodes.map(code => this.nonconfserv.updateIndicatorValue(code));
      await Promise.all(updatePromises);
      await this.loadIndicators(this.selectedProcess.id);
      this.sweetAlertService.showSuccess('Indicators refreshed successfully!');
    } catch (error) {
      console.error('❌ Error refreshing indicators:', error);
      this.sweetAlertService.showError(`Failed to refresh indicators: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      this.loadingIndicators = false;
    }
  }

  async loadIndicators(processId: number): Promise<void> {
    this.loadingIndicators = true;
    try {
      this.indicators = await this.nonconfserv.getIndicatorsForProcess(processId);
      console.log('Indicators for process:', this.indicators);
      this.nonConformities = [];
      for (const indicator of this.indicators) {
        const nonConformities: NonConformityDTO[] = await this.nonconfserv.getNonConformitiesByIndicator(indicator.idIndicateur);
        this.nonConformities.push(...nonConformities);
      }
      console.log('Non-conformities for process:', this.nonConformities);
    } catch (error) {
      console.error('❌ Error loading indicators:', error);
      this.sweetAlertService.showError(`Failed to load indicators: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.indicators = [];
      this.nonConformities = [];
    } finally {
      this.loadingIndicators = false;
    }
  }

  onDragStart(event: DragEvent, type: string): void {
    event.dataTransfer?.setData('elementType', type);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const elementType = event.dataTransfer?.getData('elementType');
    if (!elementType) return;
    const x = event.offsetX;
    const y = event.offsetY;
    this.addElementToGraph(elementType, x, y);

    const lastCell = this.graph.getLastCell();
    if (lastCell) {
      const cellView = this.paper.findViewByModel(lastCell) as joint.dia.ElementView;
      if (cellView) {
        if (elementType === 'process') this.openProcessModal(cellView);
        else if (elementType === 'operation') this.openOperationModal(cellView);
        else if (elementType === 'task') this.openTaskModal(cellView);
      }
    }
  }

  addElementToGraph(type: string, x: number, y: number): void {
    const isCircle = type === 'task';
    const element = isCircle
      ? new joint.shapes.standard.Circle()
      : new joint.shapes.standard.Rectangle();

    element.position(x, y);
    const width = type === 'process' ? 120 : type === 'operation' ? 100 : 100;
    const height = type === 'process' ? 50 : type === 'operation' ? 40 : 100;
    element.size(width, height);

    const fontSize = Math.min(width, height) * 0.2;
    const text = type === 'process' ? 'Unnamed Process' : type === 'operation' ? 'Unnamed Operation' : 'Unnamed Task';

    element.attr({
      body: {
        fill: type === 'process' ? '#3498db' : type === 'operation' ? '#e67e22' : '#2ecc71',
        stroke: 'black',
        strokeWidth: 1,
      },
      label: {
        text: text,
        fill: 'white',
        fontSize: fontSize,
        fontFamily: 'Arial',
        textWrap: {
          width: width * 0.8,
          height: height * 0.8,
          ellipsis: true,
        },
      },
    });
    element.prop('elementType', type);
    this.graph.addCell(element);

    if (type === 'process') {
      this.processes.push({ procName: 'Unnamed Process', x, y, description: '' });
    } else if (type === 'operation') {
      this.operations.push({ operationName: 'Unnamed Operation', operationDescription: '', x, y, postes: [] });
    } else if (type === 'task') {
      this.tasks.push({ taskDescription: 'Unnamed Task', taskStatus: 'TODO', x, y });
    }
  }

  openProcessModal(elementView: joint.dia.ElementView): void {
    if (elementView.model.prop('elementType') === 'process') {
      this.selectedElement = elementView.model as joint.shapes.standard.Rectangle | joint.shapes.standard.Circle;
      this.selectedElementView = elementView;
      const position = this.selectedElement.position();
      const process = this.processes.find(p => p.x === position.x && p.y === position.y);
      if (process) {
        this.processForm.patchValue({ ...process });
      }
      this.modalService.open(this.addProcessTask, { centered: true });
    }
  }

  openOperationModal(elementView: joint.dia.ElementView): void {
    if (elementView.model.prop('elementType') === 'operation') {
      this.selectedElement = elementView.model as joint.shapes.standard.Rectangle | joint.shapes.standard.Circle;
      this.selectedElementView = elementView;
      const position = this.selectedElement.position();
      const operation = this.operations.find(op => op.x === position.x && op.y === position.y);
      if (operation) {
        this.operationForm.patchValue({
          ...operation,
          postes: operation.postes?.map(p => p.id) || [],
        });
        if (operation.id) this.loadPostesForOperation(operation.id);
        else this.operationPostes = [];
      }
      this.modalService.open(this.addOperationModal, { centered: true });
    }
  }

  openTaskModal(elementView: joint.dia.ElementView): void {
    if (elementView.model.prop('elementType') === 'task') {
      this.selectedElement = elementView.model as joint.shapes.standard.Rectangle | joint.shapes.standard.Circle;
      this.selectedElementView = elementView;
      const position = this.selectedElement.position();
      const task = this.tasks.find(t => t.x === position.x && t.y === position.y);
      if (task) {
        this.taskForm.patchValue({ ...task });
      }
      this.modalService.open(this.addTaskModal, { centered: true });
    }
  }

  enableAssignMode(): void {
    this.isAssignMode = true;
    this.selectedElement = null;
    this.secondSelectedElement = null;
    this.sweetAlertService.showInfo('Assign Mode: Click Process -> Operation or Operation -> Task.');
  }

  async createLink(): Promise<void> {
    if (!this.isAssignMode || !this.selectedElement || !this.secondSelectedElement) {
      this.sweetAlertService.showError('Enable Assign Mode and select two elements.');
      this.isAssignMode = false;
      return;
    }

    const sourceType = this.selectedElement.prop('elementType');
    const targetType = this.secondSelectedElement.prop('elementType');
    if ((sourceType === 'process' && targetType === 'operation') || (sourceType === 'operation' && targetType === 'task')) {
      const link = new joint.shapes.standard.Link();
      link.source(this.selectedElement);
      link.target(this.secondSelectedElement);
      link.attr('line/stroke', '#000');
      link.attr('line/targetMarker', { type: 'path', d: 'M 10 -5 0 0 10 5 Z' });
      this.graph.addCell(link);

      await this.assignElements(sourceType, targetType, link);
    } else {
      this.sweetAlertService.showError('Invalid assignment: Use Process -> Operation or Operation -> Task.');
    }

    this.isAssignMode = false;
    this.selectedElement = null;
    this.secondSelectedElement = null;
  }

  private async assignElements(sourceType: string, targetType: string, link: joint.dia.Link): Promise<void> {
    const sourcePosition = this.selectedElement!.position();
    const targetPosition = this.secondSelectedElement!.position();

    let sourceId: number | undefined;
    let targetId: number | undefined;

    if (sourceType === 'process') {
      const process = this.processes.find(p => (p.x ?? 0) === sourcePosition.x && (p.y ?? 0) === sourcePosition.y);
      sourceId = process?.id;
    } else if (sourceType === 'operation') {
      const operation = this.operations.find(op => (op.x ?? 0) === sourcePosition.x && (op.y ?? 0) === sourcePosition.y);
      sourceId = operation?.id;
    }

    if (targetType === 'operation') {
      const operation = this.operations.find(op => (op.x ?? 0) === targetPosition.x && (op.y ?? 0) === targetPosition.y);
      targetId = operation?.id;
    } else if (targetType === 'task') {
      const task = this.tasks.find(t => (t.x ?? 0) === targetPosition.x && (t.y ?? 0) === targetPosition.y);
      targetId = task?.id;
    }

    if (!sourceId || !targetId) {
      this.sweetAlertService.showError('Cannot assign: Missing source or target ID.');
      link.remove();
      return;
    }

    try {
      await lastValueFrom(
        await this.processService.createLinkAndAssign(
          sourceType,
          targetType,
          sourceId,
          targetId,
          this.processes,
          this.operations,
          this.tasks
        )
      );

      if (sourceType === 'process' && targetType === 'operation') {
        const process = this.processes.find(p => p.id === sourceId);
        const operation = this.operations.find(op => op.id === targetId);
        if (process && operation) {
          operation.process = process.id !== undefined ? { id: process.id } : null;
          this.sweetAlertService.showSuccess(`Operation ${operation.operationName} assigned to Process ${process.procName}`);
        }
      } else if (sourceType === 'operation' && targetType === 'task') {
        const operation = this.operations.find(op => op.id === sourceId);
        const task = this.tasks.find(t => t.id === targetId);
        if (operation && task) {
          task.operation = operation.id !== undefined ? { id: operation.id } : null;
          this.sweetAlertService.showSuccess(`Task ${task.taskDescription} assigned to Operation ${operation.operationName}`);
        }
      }
    } catch (error) {
      this.sweetAlertService.showError(`Failed to assign: ${error instanceof Error ? error.message : 'Unknown error'}`);
      link.remove();
    }
  }

  updateElement(): void {
    if (!this.selectedElement) return;
    const element = this.selectedElement as joint.dia.Element;
    const width = this.selectedElementWidth;
    const height = this.selectedElementHeight;

    const fontSize = Math.min(width, height) * 0.2;

    element.attr('label/text', this.selectedElementName);
    element.attr('body/fill', this.selectedElementColor);
    element.size(width, height);
    element.attr('label/fontFamily', this.selectedElementFontFamily);
    element.attr('label/fontSize', fontSize);
    element.attr('label/textWrap', {
      width: width * 0.8,
      height: height * 0.8,
      ellipsis: true,
    });

    const currentShape = element instanceof joint.shapes.standard.Circle ? 'circle' : 'rectangle';
    if (currentShape !== this.selectedElementShape) {
      const newElement = this.selectedElementShape === 'circle'
        ? new joint.shapes.standard.Circle()
        : new joint.shapes.standard.Rectangle();
      newElement.position(element.position().x, element.position().y);
      newElement.size(width, height);
      newElement.attr({
        body: { fill: this.selectedElementColor, stroke: 'black', strokeWidth: 1 },
        label: {
          text: this.selectedElementName,
          fill: 'white',
          fontSize: fontSize,
          fontFamily: this.selectedElementFontFamily,
          textWrap: {
            width: width * 0.8,
            height: height * 0.8,
            ellipsis: true,
          },
        },
      });
      this.graph.getConnectedLinks(element).forEach(link => {
        if (link.get('source').id === element.id) link.source(newElement);
        if (link.get('target').id === element.id) link.target(newElement);
      });
      newElement.prop('elementType', element.prop('elementType'));
      this.graph.addCell(newElement);
      element.remove();
      this.selectedElement = newElement;
    }
  }

  openWorkflowNameModal(): void {
    this.workflowNameForm.reset();
    this.modalService.open(this.workflowNameModal, { centered: true });
  }

  async saveWorkflow(): Promise<void> {
    if (this.processes.length === 0 || this.processes.some(p => !p.procName?.trim())) {
      this.sweetAlertService.showError('Cannot save: At least one valid process is required.');
      return;
    }
    this.openWorkflowNameModal();
  }

  async submitWorkflowName(): Promise<void> {
    if (this.workflowNameForm.invalid) {
      this.sweetAlertService.showError('Please enter a valid workflow name (minimum 3 characters).');
      return;
    }

    this.syncGraphRelations();
    const graphJSON = this.prepareGraphJSON();
    const paperState = JSON.stringify({
      translation: this.paper.translate(),
      scale: this.paper.scale(),
      dimensions: { width: this.paperContainer.nativeElement.offsetWidth || 800, height: 600 },
    });
    const paperSnapshot = this.capturePaperSnapshot();

    // Prepare the workflow data to send to the backend
    const workflowData: Workflow = {
      name: this.workflowNameForm.get('workflowName')?.value,
      workflowData: JSON.stringify(graphJSON),
      processes: this.processes.map(process => ({
        ...process,
        id: undefined, // Remove id for new processes (let backend generate it)
        operations: process.operations?.map(operation => ({
          ...operation,
          id: undefined, // Remove id for new operations
          tasks: operation.tasks?.map(task => ({
            ...task,
            id: undefined, // Remove id for new tasks
          })) || [],
        })) || [],
        objectives: process.objectives || [],
      })),
      paperState,
      paperSnapshot,
    };

    // Log the payload for debugging
    console.log('Payload sent to backend:', JSON.stringify(workflowData, null, 2));

    try {
      const savedWorkflow = await lastValueFrom(await this.processService.addWorkflow(workflowData));
      console.log('✅ Workflow saved:', savedWorkflow);
      this.sweetAlertService.showSuccess(`Workflow "${savedWorkflow.name}" saved successfully!`);
      await this.loadWorkflowNames(); // Refresh the dropdown
      this.modalService.dismissAll();
    } catch (error) {
      console.error('❌ Save error:', error);
      this.sweetAlertService.showError(`Failed to save workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private syncGraphRelations(): void {
    for (const process of this.processes) {
      process.id = undefined;
      process.operations = [];
      process.procName ||= 'Unnamed Process';
      process.x = process.x ?? 0;
      process.y = process.y ?? 0;
      process.description = process.description ?? '';
      process.creationDate = process.creationDate ?? null;
      process.modifDate = process.modifDate ?? null;
      process.finishDate = process.finishDate ?? null;
      process.pilote = process.pilote ?? null;
      process.objectives = process.objectives ?? [];
      process.workflow = null;
    }

    for (const operation of this.operations) {
      operation.id = undefined;
      operation.tasks = [];
      operation.operationName ||= 'Unnamed Operation';
      operation.operationDescription = operation.operationDescription ?? '';
      operation.creationDate = operation.creationDate ?? null;
      operation.finishDate = operation.finishDate ?? null;
      operation.x = operation.x ?? 0;
      operation.y = operation.y ?? 0;
      operation.postes = operation.postes ?? [];
      operation.userEntities = operation.userEntities ?? [];
      operation.process = null;
    }

    for (const task of this.tasks) {
      task.id = undefined;
      task.taskDescription ||= 'Unnamed Task';
      task.taskStatus ||= 'TODO';
      task.creationDate = task.creationDate ?? null;
      task.finishDate = task.finishDate ?? null;
      task.x = task.x ?? 0;
      task.y = task.y ?? 0;
      task.operation = null;
    }

    // Rebuild relationships based on JointJS links
    this.graph.getLinks().forEach((link: joint.dia.Link) => {
      const sourceElement = link.getSourceElement();
      const targetElement = link.getTargetElement();
      if (!sourceElement || !targetElement) return;

      const sourceType = sourceElement.prop('elementType');
      const targetType = targetElement.prop('elementType');
      const sourcePosition = sourceElement.position();
      const targetPosition = targetElement.position();

      if (sourceType === 'process' && targetType === 'operation') {
        const process = this.processes.find(p => (p.x ?? 0) === sourcePosition.x && (p.y ?? 0) === sourcePosition.y);
        const operation = this.operations.find(op => (op.x ?? 0) === targetPosition.x && (op.y ?? 0) === targetPosition.y);
        if (process && operation) {
          process.operations = process.operations || [];
          if (!process.operations.some(op => op.operationName === operation.operationName)) {
            process.operations.push({ ...operation, process: undefined });
          }
          operation.process = process.id !== undefined ? { id: process.id } : null;
        }
      } else if (sourceType === 'operation' && targetType === 'task') {
        const operation = this.operations.find(op => (op.x ?? 0) === sourcePosition.x && (op.y ?? 0) === targetPosition.y);
        const task = this.tasks.find(t => (t.x ?? 0) === targetPosition.x && (t.y ?? 0) === targetPosition.y);
        if (operation && task) {
          operation.tasks = operation.tasks || [];
          if (!operation.tasks.some(t => t.taskDescription === task.taskDescription)) {
            operation.tasks.push({ ...task, operation: undefined });
          }
          task.operation = operation.id !== undefined ? { id: operation.id } : null;
        }
      }
    });
  }

  private prepareGraphJSON(): any {
    const graphJSON = this.graph.toJSON();
    graphJSON.cells.forEach((cell: any) => {
      if (cell.type === 'standard.Rectangle' || cell.type === 'standard.Circle') {
        cell.markup = cell.type === 'standard.Circle'
          ? [{ tagName: 'circle', selector: 'body' }, { tagName: 'text', selector: 'label' }]
          : [{ tagName: 'rect', selector: 'body' }, { tagName: 'text', selector: 'label' }];
        cell.attrs = cell.attrs || {};
        cell.attrs.body = cell.attrs.body || {
          fill: cell.elementType === 'process' ? '#3498db' : cell.elementType === 'operation' ? '#e67e22' : '#2ecc71',
          stroke: 'black',
          strokeWidth: 1,
        };
        cell.attrs.label = cell.attrs.label || {
          text: cell.elementType === 'process' ? 'Unnamed Process' : cell.elementType === 'operation' ? 'Unnamed Operation' : 'Unnamed Task',
          fill: 'white',
          fontSize: cell.attrs.label?.fontSize || 12,
          fontFamily: 'Arial',
          textWrap: cell.attrs.label?.textWrap || {},
        };
      } else if (cell.type === 'standard.Link') {
        cell.markup = [{ tagName: 'path', selector: 'line' }];
        cell.attrs = cell.attrs || { line: { stroke: '#000', targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 Z' } } };
      }
    });
    return graphJSON;
  }

  private capturePaperSnapshot(): string | undefined {
    try {
      this.paper.drawBackground(); // Ensure the paper is fully rendered
      const svgElement = this.paper.el.querySelector('svg') as SVGSVGElement;
      return svgElement ? new XMLSerializer().serializeToString(svgElement) : undefined;
    } catch (error) {
      console.error('Failed to capture SVG snapshot:', error);
      return undefined;
    }
  }

  async loadWorkflowByName(): Promise<void> {
    if (!this.selectedWorkflowName) {
      this.sweetAlertService.showError('Please select a workflow to load.');
      return;
    }

    try {
      const workflow = await lastValueFrom(await this.processService.loadWorkflowByName(this.selectedWorkflowName));
      if (!workflow.workflowData) {
        this.sweetAlertService.showError('Error: No workflow data found!');
        return;
      }

      const parsedData = JSON.parse(workflow.workflowData);
      this.graph.clear();
      this.snapshotContainer.innerHTML = '';
      this.loadedSnapshot = workflow.paperSnapshot || null;

      parsedData.cells.forEach((cell: any) => {
        if (cell.type === 'standard.Rectangle' || cell.type === 'standard.Circle') {
          cell.markup = cell.type === 'standard.Circle'
            ? [{ tagName: 'circle', selector: 'body' }, { tagName: 'text', selector: 'label' }]
            : [{ tagName: 'rect', selector: 'body' }, { tagName: 'text', selector: 'label' }];
          cell.attrs = cell.attrs || {};
          cell.attrs.body = cell.attrs.body || {
            fill: cell.elementType === 'process' ? '#3498db' : cell.elementType === 'operation' ? '#e67e22' : '#2ecc71',
            stroke: 'black',
            strokeWidth: 1,
          };
          cell.attrs.label = cell.attrs.label || {
            text: cell.elementType === 'process' ? 'Unnamed Process' : cell.elementType === 'operation' ? 'Unnamed Operation' : 'Unnamed Task',
            fill: 'white',
            fontSize: cell.attrs.label?.fontSize || 12,
            fontFamily: 'Arial',
            textWrap: cell.attrs.label?.textWrap || {},
          };
        } else if (cell.type === 'standard.Link') {
          cell.markup = [{ tagName: 'path', selector: 'line' }];
          cell.attrs = cell.attrs || { line: { stroke: '#000', targetMarker: { type: 'path', d: 'M 10 -5 0 0 10 5 Z' } } };
        }
      });

      this.graph.fromJSON(parsedData);
      this.processes = workflow.processes?.map(p => ({ ...p, operations: p.operations || [], objectives: p.objectives || [], workflow: null })) || [];
      this.operations = workflow.operations?.map(o => ({ ...o, tasks: o.tasks || [], postes: o.postes || [], process: o.process || null })) || [];
      this.tasks = workflow.tasks?.map(t => ({ ...t, operation: t.operation || null })) || [];

      this.updateGraphLabels();
      this.restorePaperState(workflow.paperState);

      this.showSnapshot = false;
      this.paperContainer.nativeElement.style.display = 'block';
      this.snapshotContainer.style.display = 'none';
      this.sweetAlertService.showSuccess(`Workflow "${workflow.name}" loaded successfully!`);
    } catch (error) {
      console.error('Error loading workflow:', error);
      this.sweetAlertService.showError(`Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateGraphLabels(): void {
    this.graph.getElements().forEach((element: joint.dia.Element) => {
      const elementType = element.prop('elementType');
      const elementId = element.id; // Use element ID for matching
      if (elementType === 'process') {
        const process = this.processes.find(p => p.id && element.attr('label/text') === p.procName);
        if (process) {
          const width = element.size().width;
          const height = element.size().height;
          const fontSize = Math.min(width, height) * 0.2;
          element.attr('label/text', process.procName);
          element.attr('label/fontSize', fontSize);
          element.attr('label/textWrap', {
            width: width * 0.8,
            height: height * 0.8,
            ellipsis: true,
          });
          element.position(process.x || 0, process.y || 0);
        }
      } else if (elementType === 'operation') {
        const operation = this.operations.find(op => op.id && element.attr('label/text') === op.operationName);
        if (operation) {
          const width = element.size().width;
          const height = element.size().height;
          const fontSize = Math.min(width, height) * 0.2;
          element.attr('label/text', operation.operationName);
          element.attr('label/fontSize', fontSize);
          element.attr('label/textWrap', {
            width: width * 0.8,
            height: height * 0.8,
            ellipsis: true,
          });
          element.position(operation.x || 0, operation.y || 0);
        }
      } else if (elementType === 'task') {
        const task = this.tasks.find(t => t.id && element.attr('label/text') === t.taskDescription);
        if (task) {
          const width = element.size().width;
          const height = element.size().height;
          const fontSize = Math.min(width, height) * 0.2;
          element.attr('label/text', task.taskDescription);
          element.attr('label/fontSize', fontSize);
          element.attr('label/textWrap', {
            width: width * 0.8,
            height: height * 0.8,
            ellipsis: true,
          });
          element.position(task.x || 0, task.y || 0);
        }
      }
    });
  }

  private restorePaperState(paperState: string | undefined): void {
    try {
      if (paperState) {
        const state = JSON.parse(paperState);
        this.paper.setDimensions(state.dimensions.width || 800, state.dimensions.height || 600);
        this.paper.scale(state.scale.sx || 1, state.scale.sy || 1);
        this.paper.translate(state.translation.tx || 0, state.translation.ty || 0);
      } else {
        throw new Error('No paper state provided');
      }
    } catch (error) {
      console.warn('⚠️ Invalid or missing paper state, using defaults:', error);
      this.paper.setDimensions(800, 600);
      this.paper.scale(1, 1);
      this.paper.translate(0, 0);
    }
  }

  async showSavedSnapshot(id: number): Promise<void> {
    try {
      const workflow = await lastValueFrom(await this.processService.loadWorkflow(id));
      if (!workflow.paperSnapshot) {
        this.sweetAlertService.showError(`No snapshot found for Workflow ID: ${id}`);
        this.loadedSnapshot = null;
        this.showSnapshot = false;
        this.paperContainer.nativeElement.style.display = 'block';
        this.snapshotContainer.style.display = 'none';
        return;
      }
      this.loadedSnapshot = workflow.paperSnapshot;
      this.showSnapshot = true;
      this.snapshotContainer.innerHTML = this.loadedSnapshot;
      this.paperContainer.nativeElement.style.display = 'none';
      this.snapshotContainer.style.display = 'block';
      this.sweetAlertService.showSuccess(`Snapshot loaded for Workflow ID: ${id}`);
    } catch (error) {
      this.sweetAlertService.showError(`Failed to load snapshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.loadedSnapshot = null;
      this.showSnapshot = false;
      this.paperContainer.nativeElement.style.display = 'block';
      this.snapshotContainer.style.display = 'none';
    }
  }

  toggleDisplayMode(): void {
    this.showSnapshot = !this.showSnapshot;
    if (this.showSnapshot && this.loadedSnapshot) {
      this.snapshotContainer.innerHTML = this.loadedSnapshot;
      this.paperContainer.nativeElement.style.display = 'none';
      this.snapshotContainer.style.display = 'block';
    } else {
      this.snapshotContainer.innerHTML = '';
      this.paperContainer.nativeElement.style.display = 'block';
      this.snapshotContainer.style.display = 'none';
    }
  }

  async deleteLinkOrElement(): Promise<void> {
    if (this.selectedLink) {
      const sourceElement = this.selectedLink.getSourceElement();
      const targetElement = this.selectedLink.getTargetElement();
      const sourceType = sourceElement?.prop('elementType');
      const targetType = targetElement?.prop('elementType');
      const sourcePosition = sourceElement?.position();
      const targetPosition = targetElement?.position();

      let sourceId: number | undefined;
      let targetId: number | undefined;

      if (sourceType === 'process') {
        const process = this.processes.find(p => (p.x ?? 0) === sourcePosition?.x && (p.y ?? 0) === sourcePosition?.y);
        sourceId = process?.id;
      } else if (sourceType === 'operation') {
        const operation = this.operations.find(op => (op.x ?? 0) === sourcePosition?.x && (op.y ?? 0) === sourcePosition?.y);
        sourceId = operation?.id;
      }

      if (targetType === 'operation') {
        const operation = this.operations.find(op => (op.x ?? 0) === targetPosition?.x && (op.y ?? 0) === targetPosition?.y);
        targetId = operation?.id;
      } else if (targetType === 'task') {
        const task = this.tasks.find(t => (t.x ?? 0) === targetPosition?.x && (t.y ?? 0) === targetPosition?.y);
        targetId = task?.id;
      }

      if (!sourceId || !targetId) {
        this.sweetAlertService.showError('Cannot delete link: Missing source or target ID.');
        return;
      }

      try {
        if (sourceType === 'process' && targetType === 'operation') {
          const process = this.processes.find(p => p.id === sourceId);
          const operation = this.operations.find(op => op.id === targetId);
          if (process && operation) {
            process.operations = process.operations?.filter(op => op.id !== operation.id) || [];
            operation.process = null;
            this.sweetAlertService.showSuccess(`Operation ${operation.operationName} unassigned from Process ${process.procName}`);
          }
        } else if (sourceType === 'operation' && targetType === 'task') {
          const operation = this.operations.find(op => op.id === sourceId);
          const task = this.tasks.find(t => t.id === targetId);
          if (operation && task) {
            operation.tasks = operation.tasks?.filter(t => t.id !== task.id) || [];
            task.operation = null;
            this.sweetAlertService.showSuccess(`Task ${task.taskDescription} unassigned from Operation ${operation.operationName}`);
          }
        } else {
          this.sweetAlertService.showError('Invalid link type for deletion.');
          return;
        }

        this.selectedLink.remove();
        this.selectedLink = null;
        this.sweetAlertService.showSuccess('Link deleted successfully.');
      } catch (error) {
        this.sweetAlertService.showError(`Failed to delete link: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (this.selectedElement && !this.isAssignMode) {
      const elementType = this.selectedElement.prop('elementType');
      const position = this.selectedElement.position();
      if (elementType === 'process') {
        this.processes = this.processes.filter(p => (p.x ?? 0) !== position.x || (p.y ?? 0) !== position.y);
      } else if (elementType === 'operation') {
        this.operations = this.operations.filter(op => (op.x ?? 0) !== position.x || (op.y ?? 0) !== position.y);
      } else if (elementType === 'task') {
        this.tasks = this.tasks.filter(t => (t.x ?? 0) !== position.x || (t.y ?? 0) !== position.y);
      }
      this.selectedElement.remove();
      this.selectedElement = null;
      this.selectedElementView = null;
      this.sweetAlertService.showSuccess('Element deleted successfully.');
    }
  }

  getSelectedElementPosition(): { x: number; y: number } {
    return this.selectedElement ? this.selectedElement.position() : { x: 0, y: 0 };
  }

  async saveProcessToDatabase(): Promise<void> {
    if (!this.selectedElement || this.processForm.invalid) {
      this.sweetAlertService.showError('No process selected or invalid form.');
      return;
    }
    const position = this.getSelectedElementPosition();
    const processData: Process = {
      ...this.processForm.value,
      x: position.x,
      y: position.y,
      creationDate: this.processForm.value.creationDate || new Date().toISOString().split('T')[0],
      modifDate: this.processForm.value.modifDate || new Date().toISOString().split('T')[0],
      finishDate: this.processForm.value.finishDate || null,
      objectives: this.selectedObjective ? [this.selectedObjective] : [],
    };

    try {
      const savedProcess = await lastValueFrom(await this.processService.addProcess(processData));
      this.selectedElement.attr('label/text', processData.procName);
      const width = this.selectedElement.size().width;
      const height = this.selectedElement.size().height;
      const fontSize = Math.min(width, height) * 0.2;
      this.selectedElement.attr('label/fontSize', fontSize);
      this.selectedElement.attr('label/textWrap', {
        width: width * 0.8,
        height: height * 0.8,
        ellipsis: true,
      });
      const processIndex = this.processes.findIndex(p => p.x === position.x && p.y === position.y);
      if (processIndex !== -1) this.processes[processIndex] = { ...processData, id: savedProcess.id };
      this.sweetAlertService.showSuccess('Process saved successfully!');
      this.modalService.dismissAll();
      this.processForm.reset();
      this.selectedObjective = null;
      this.submitted = false;
    } catch (error) {
      this.sweetAlertService.showError(`Failed to save process: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveOperationToDatabase(): Promise<void> {
    if (!this.selectedElement || this.operationForm.invalid) {
      this.sweetAlertService.showError('No operation selected or invalid form.');
      return;
    }
    const position = this.getSelectedElementPosition();
    const operationData: Operation = {
      ...this.operationForm.value,
      x: position.x,
      y: position.y,
      creationDate: this.operationForm.value.creationDate || new Date().toISOString().split('T')[0],
      finishDate: this.operationForm.value.finishDate || null,
      postes: this.operationForm.value.postes.map((id: number) => ({ id })),
    };

    try {
      const savedOperation = await lastValueFrom(await this.processService.addOperation(operationData));
      this.selectedElement.attr('label/text', operationData.operationName);
      const width = this.selectedElement.size().width;
      const height = this.selectedElement.size().height;
      const fontSize = Math.min(width, height) * 0.2;
      this.selectedElement.attr('label/fontSize', fontSize);
      this.selectedElement.attr('label/textWrap', {
        width: width * 0.8,
        height: height * 0.8,
        ellipsis: true,
      });
      const operationIndex = this.operations.findIndex(op => op.x === position.x && op.y === position.y);
      if (operationIndex !== -1) {
        this.operations[operationIndex] = { ...operationData, id: savedOperation.id };
        const posteIds = new Set<number>(this.operationForm.value.postes);
        if (savedOperation.id && posteIds.size > 0) {
          await this.assignPostesToOperation(savedOperation.id, posteIds);
        }
      }
      this.sweetAlertService.showSuccess('Operation saved successfully!');
      this.modalService.dismissAll();
      this.operationForm.reset();
      this.submitted = false;
    } catch (error) {
      this.sweetAlertService.showError(`Failed to save operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async saveTaskToDatabase(): Promise<void> {
    if (!this.selectedElement || this.taskForm.invalid) {
      this.sweetAlertService.showError('No task selected or invalid form.');
      return;
    }
    const position = this.getSelectedElementPosition();
    const taskData: Task = {
      ...this.taskForm.value,
      x: position.x,
      y: position.y,
      creationDate: this.taskForm.value.creationDate || new Date().toISOString().split('T')[0],
      finishDate: this.taskForm.value.finishDate || null,
    };

    try {
      const savedTask = await lastValueFrom(await this.processService.addTask(taskData));
      this.selectedElement.attr('label/text', taskData.taskDescription);
      const width = this.selectedElement.size().width;
      const height = this.selectedElement.size().height;
      const fontSize = Math.min(width, height) * 0.2;
      this.selectedElement.attr('label/fontSize', fontSize);
      this.selectedElement.attr('label/textWrap', {
        width: width * 0.8,
        height: height * 0.8,
        ellipsis: true,
      });
      const taskIndex = this.tasks.findIndex(t => t.x === position.x && t.y === position.y);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = { ...taskData, id: savedTask.id };
        const dataIds = new Set<number>(this.taskForm.value.dataIds);
        if (savedTask.id && dataIds.size > 0) {
          await this.assignDataToTask(savedTask.id, dataIds);
        }
      }
      this.sweetAlertService.showSuccess('Task saved successfully!');
      this.modalService.dismissAll();
      this.taskForm.reset();
      this.submitted = false;
    } catch (error) {
      this.sweetAlertService.showError(`Failed to save task: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  addProcess(): void {
    this.submitted = true;
    if (this.processForm.invalid) {
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }
    this.saveProcessToDatabase();
  }

  addOperation(): void {
    this.submitted = true;
    if (this.operationForm.invalid) {
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }
    this.saveOperationToDatabase();
  }

  addTask(): void {
    this.submitted = true;
    if (this.taskForm.invalid) {
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }
    this.saveTaskToDatabase();
  }

  async addObjective(): Promise<void> {
    this.submitted = true;
    if (this.objectiveForm.invalid) {
      this.sweetAlertService.showError('Please fill in all required fields.');
      return;
    }
    try {
      const objective = await lastValueFrom(await this.processService.addObjective(this.objectiveForm.value));
      this.objectives.push(objective);
      this.modalService.dismissAll();
      this.objectiveForm.reset();
      this.submitted = false;
      this.sweetAlertService.showSuccess('Objective added successfully!');
    } catch (error) {
      this.sweetAlertService.showError(`Failed to add objective: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  openObjectiveModal(content: any): void {
    this.modalService.open(content, { centered: true });
  }

  async loadWorkflowNames(): Promise<void> {
    try {
      this.workflowNames = await lastValueFrom(this.processService.getAllWorkflowNames());
      console.log('✅ Workflow names loaded:', this.workflowNames);
    } catch (error) {
      this.sweetAlertService.showError(`Failed to load workflow names: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.workflowNames = [];
    }
  }

  async loadUsersFromKeycloak(): Promise<void> {
    try {
      this.users = await lastValueFrom(await this.processService.loadUsersFromKeycloak());
      console.log('✅ Users loaded:', this.users);
    } catch (error) {
      this.sweetAlertService.showError(`Failed to load users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadPostes(): Promise<void> {
    try {
      this.postes = await lastValueFrom(await this.processService.getAllPostes());
      console.log('✅ Postes loaded:', this.postes);
    } catch (error) {
      this.sweetAlertService.showError(`Failed to load postes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadPostesForOperation(operationId: number): Promise<void> {
    try {
      this.operationPostes = await lastValueFrom(await this.processService.getPostesForOperation(operationId));
      this.operationForm.patchValue({ postes: this.operationPostes.map(p => p.id) });
      console.log(`✅ Postes loaded for operation ${operationId}:`, this.operationPostes);
    } catch (error) {
      this.sweetAlertService.showError(`Failed to load postes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async loadAllData(): Promise<void> {
    try {
      this.dataList = await lastValueFrom(await this.processService.getAllData());
      console.log('✅ Data loaded:', this.dataList);
    } catch (error) {
      this.sweetAlertService.showError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async assignPostesToOperation(operationId: number, posteIds: Set<number>): Promise<void> {
    try {
      await lastValueFrom(await this.processService.assignPostesToOperation(operationId, posteIds));
      console.log(`✅ Postes assigned to operation ${operationId}:`, posteIds);
      this.sweetAlertService.showSuccess('Postes assigned successfully!');
    } catch (error) {
      console.error('❌ Error assigning postes:', error);
      this.sweetAlertService.showError(`Failed to assign postes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async assignDataToTask(taskId: number, dataIds: Set<number>): Promise<void> {
    try {
      await lastValueFrom(await this.processService.assignDataToTask(taskId, dataIds));
      console.log(`✅ Data assigned to task ${taskId}:`, dataIds);
      this.sweetAlertService.showSuccess('Data assigned successfully!');
    } catch (error) {
      console.error('❌ Error assigning data:', error);
      this.sweetAlertService.showError(`Failed to assign data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
    if (this.showChatbot) {
      setTimeout(() => {
        const popup = this.chatbotPopup?.nativeElement;
        if (popup) {
          popup.style.left = '50%';
          popup.style.top = '50%';
          popup.style.transform = 'translate(-50%, -50%)';
        }
      }, 0);
    }
    this.isVoiceMode = false; // Reset voice mode when toggling
  }

  toggleVoiceMode(): void {
    this.isVoiceMode = !this.isVoiceMode;
    if (this.isVoiceMode) {
      this.sendVoiceQuestion();
    }
  }

  sendTextQuestion(): void {
    if (!this.chatbotQuestion.trim()) {
      this.sweetAlertService.showError('Please enter a question.');
      return;
    }

    this.isChatbotLoading = true;
    this.chatbotService.sendTextQuestion(this.chatbotQuestion).subscribe({
      next: (response) => {
        this.chatHistory.push({
          question: this.chatbotQuestion,
          response: response.response || 'No response received.',
        });
        this.chatbotService.speakResponse(response.response); // Speak the response client-side
        this.chatbotQuestion = '';
        this.isChatbotLoading = false;
      },
      error: (error) => {
        this.sweetAlertService.showError(
          `Failed to get chatbot response: ${error.message || 'Unknown error'}`
        );
        this.isChatbotLoading = false;
      },
    });
  }

  sendVoiceQuestion(): void {
    this.isChatbotLoading = true;
    this.chatbotService.sendVoiceQuestion().subscribe({
      next: (response) => {
        this.chatHistory.push({
          question: response.query || 'Voice input',
          response: response.response || 'No response received.',
        });
        this.chatbotService.speakResponse(response.response); // Speak the response client-side (in addition to server-side)
        this.isChatbotLoading = false;
      },
      error: (error) => {
        this.sweetAlertService.showError(
          `Failed to get chatbot response: ${error.message || 'Unknown error'}`
        );
        this.isChatbotLoading = false;
      },
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { Bug, ProjectTaskDTO, Project, Phase } from '@core/models/project.model';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '@/app/services/project.service';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { NgbModal, NgbPagination, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bugsfortask',
  templateUrl: './bugsfortask.component.html',
  styleUrls: ['./bugsfortask.component.scss'],
  imports: [
    NgIf,
    NgForOf,
    NgClass,
    DatePipe,
    NgbPagination,
    FormsModule,
    NgbTooltip,
  ],
  standalone: true,
})
export class BugsfortaskComponent implements OnInit {
  task: ProjectTaskDTO | undefined;
  bugs: Bug[] = [];
  selectedBugg: Bug = {
    priority: '',
    description: '',
    source_issue: '',
    status: '',
    repportDate: '',
  };
  project: Project | undefined;
  displayedBugs: Bug[] = [];
  projectName: string | undefined;
  phaseName: string | undefined;
  currentPage: number = 1;
  pageSize: number = 4; // Remplace itemsPerPage
  expandedBugId: number | null = null;
  correctionSuggestion: string = '';
  selectedBug: Bug | undefined;
  rootCauseAnalysis: string = '';
  codeCorrectionSuggestion: string = '';
  performanceImprovementTips: string = '';

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const taskId = Number(this.route.snapshot.paramMap.get('idtask'));
    if (!isNaN(taskId)) {
      this.projectService.getProjectByTaskId(taskId).subscribe({
        next: (project: Project) => {
          this.projectName = project.name;
          const phase = this.findPhaseByTaskId(project, taskId);
          if (phase) {
            this.phaseName = phase.phase_name;
            this.task = this.findTaskInPhase(phase, taskId);
            this.bugs = (this.task?.bugs || [])
              .filter(bug => bug.idBug !== undefined && bug.idBug !== null)
              .sort((a, b) => a.idBug! - b.idBug!);
            this.refreshBugs();
          }
        },
        error: (err) =>
          console.error('❌ Erreur lors du chargement des bugs:', err),
      });
    }
  }

  refreshBugs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedBugs = this.bugs.slice(startIndex, endIndex);
  }

  getBugsForCurrentPage(): Bug[] {
    return this.displayedBugs; // Retourne directement les bugs affichés
  }

  toggleDescription(bugId: number | undefined): void {
    if (bugId === undefined) return;
    this.expandedBugId = this.expandedBugId === bugId ? null : bugId;
  }

  isExpanded(bugId: number | undefined): boolean {
    return bugId !== undefined && this.expandedBugId === bugId;
  }

  fixBug(bugId: number | undefined): void {
    if (!bugId) {
      console.error('❌ ID du bug non défini');
      return;
    }
    this.projectService.updateBugStatus(bugId, 'FIXED').subscribe({
      next: (updatedBug: Bug) => {
        const bugIndex = this.bugs.findIndex((bug) => bug.idBug === bugId);
        if (bugIndex !== -1) {
          this.bugs[bugIndex] = updatedBug;
          this.refreshBugs(); // Rafraîchir la pagination après mise à jour
        }
        console.log('✅ Bug marqué comme FIXED:', updatedBug);
      },
      error: (err) =>
        console.error('❌ Erreur lors de la mise à jour du bug:', err),
    });
  }

  openSuggestionModal(template: any, bugId: any) {
    this.selectedBug = this.bugs.find((bug) => bug.idBug === bugId);
    this.correctionSuggestion = '';
    this.rootCauseAnalysis = '';
    this.codeCorrectionSuggestion = '';
    this.performanceImprovementTips = '';

    this.projectService.suggestBugFix(bugId).subscribe({
      next: (response: any) => {
        try {
          if (typeof response === 'string') {
            response = JSON.parse(response);
          }
          this.rootCauseAnalysis =
            response.rootCauseAnalysis || 'No root cause analysis available.';
          this.codeCorrectionSuggestion =
            response.codeCorrectionSuggestion ||
            'No code correction suggestion available.';
          this.performanceImprovementTips =
            response.performanceImprovementTips ||
            'No performance improvement tips available.';
          this.modalService.open(template, { size: 'xl' });
        } catch (error) {
          console.error('❌ Erreur lors de l’analyse de la réponse:', error);
        }
      },
      error: (err) =>
        console.error(
          '❌ Erreur lors de la récupération de la suggestion:',
          err
        ),
    });
  }

  private findPhaseByTaskId(project: Project, taskId: number): Phase | undefined {
    return project.phases.find((phase) =>
      phase.projectOperations.some((operation) =>
        operation.projectTasks?.some((task) => task.id === taskId)
      )
    );
  }

  private findTaskInPhase(phase: Phase, taskId: number): ProjectTaskDTO | undefined {
    for (const operation of phase.projectOperations || []) {
      const foundTask = operation.projectTasks?.find(
        (task) => task.id === taskId
      );
      if (foundTask) return foundTask;
    }
    return undefined;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'fixed':
        return 'status-fixed';
      default:
        return 'badge-lg';
    }
  }

  getSourceIssueClass(sourceIssue: string): string {
    switch (sourceIssue?.toLowerCase()) {
      case 'alpha':
        return 'source-alpha';
      case 'support':
        return 'source-support';
      case 'in-house':
        return 'source-in-house';
      default:
        return 'badge-lg';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'medium':
        return 'priority-medium';
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      default:
        return 'badge-lg';
    }
  }

  deleteBug(idBug: number | undefined) {
    const taskId = Number(this.route.snapshot.paramMap.get('idtask'));
    Swal.fire({
      title: 'Are you sure ?',
      text: 'this action will drop definetly the bug.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteBug(idBug).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Bug deleted successfully.', 'success');
            this.projectService.getProjectByTaskId(taskId).subscribe({
              next: (project) => {
                this.projectName = project.name;
                const phase = this.findPhaseByTaskId(project, taskId);
                if (phase) {
                  this.phaseName = phase.phase_name;
                  this.task = this.findTaskInPhase(phase, taskId);
                  this.bugs = (this.task?.bugs || [])
                    .filter(bug => bug.idBug !== undefined && bug.idBug !== null)
                    .sort((a, b) => a.idBug! - b.idBug!);
                  this.refreshBugs();
                }
              },
              error: (err) =>
                console.error('❌ Erreur lors du rafraîchissement:', err),
            });
          },
          error: (error) => {
            Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
            console.error(error);
          },
        });
      }
    });
  }

  editBug(bug: any, modalTemplate: any) {
    console.log('Bug passed to edit:', bug);
    this.selectedBugg = { ...bug };
    this.modalService.open(modalTemplate, { size: 'lg' });
  }

  saveBug(modal: any): void {
    if (this.selectedBugg) {
      this.projectService.updateBug(this.selectedBugg.idBug, this.selectedBugg).subscribe(
        (response) => {
          Swal.fire({
            title: 'Success!',
            text: 'Bug updated successfully.',
            icon: 'success',
            confirmButtonText: 'OK',
          });
          modal.dismiss();
          const taskId = Number(this.route.snapshot.paramMap.get('idtask'));
          this.projectService.getProjectByTaskId(taskId).subscribe(
            (projectData) => {
              this.projectName = projectData.name;
              const phase = this.findPhaseByTaskId(projectData, taskId);
              if (phase) {
                this.phaseName = phase.phase_name;
                this.task = this.findTaskInPhase(phase, taskId);
                this.bugs = (this.task?.bugs || [])
                  .filter(bug => bug.idBug !== undefined && bug.idBug !== null)
                  .sort((a, b) => a.idBug! - b.idBug!);
                this.refreshBugs();
              }
            },
            (error) => {
              console.error('Erreur lors du rafraîchissement de la liste des bugs:', error);
            }
          );
        },
        (error) => {
          Swal.fire({
            title: 'Erreur!',
            text: 'Error while updating bug',
            icon: 'error',
            confirmButtonText: 'OK',
          });
        }
      );
    }
  }
}

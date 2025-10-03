import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '@/app/services/project.service';
import { Bug } from '@core/models/project.model';
import { DatePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { NgbPagination } from "@ng-bootstrap/ng-bootstrap";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-bugsforallproject',
  templateUrl: './bugsforallproject.component.html',
  imports: [DatePipe, NgIf, NgForOf, NgClass, NgbPagination, FormsModule],
  styleUrls: ['./bugsforallproject.component.scss'],
  standalone: true,
})
export class BugsforallprojectComponent implements OnInit {
  bugs: (Bug & {
    phaseName: string;
    operationId: number;
    taskId: number;
    projectName: string;
  })[] = [];

  thisWeekBugs: (Bug & {
    phaseName: string;
    operationId: number;
    taskId: number;
    projectName: string;
  })[] = [];

  lastWeekBugs: (Bug & {
    phaseName: string;
    operationId: number;
    taskId: number;
    projectName: string;
  })[] = [];

  lastMonthBugs: (Bug & {
    phaseName: string;
    operationId: number;
    taskId: number;
    projectName: string;
  })[] = [];
  allBugsCurrentPage = 1;
  allBugsPageSize = 4;

  thisWeekCurrentPage = 1;
  lastWeekCurrentPage = 1;
  lastMonthCurrentPage = 1;

  thisWeekPageSize = 4;
  lastWeekPageSize = 4;
  lastMonthPageSize = 4;

  expandedBugId: number | null = null;

  projectId!: number;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('idproject');
    this.projectId = id ? Number(id) : 0;

    if (this.projectId > 0) {
      this.loadBugs();
    } else {
      console.error('❌ ID de projet invalide');
    }
  }

  private loadBugs(): void {
    this.projectService.getBugsForProject(this.projectId).subscribe({
      next: (bugs) => {
        this.bugs = bugs || [];
        this.filterBugsByTime();
      },
      error: (err) => console.error('❌ Erreur lors du chargement des bugs:', err),
    });
  }

  private filterBugsByTime(): void {
    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const endOfLastWeek = new Date(endOfWeek);
    endOfLastWeek.setDate(endOfWeek.getDate() - 7);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    this.thisWeekBugs = this.bugs.filter(bug => {
      const date = new Date(bug.repportDate);
      return date >= startOfWeek && date <= endOfWeek;
    });

    this.lastWeekBugs = this.bugs.filter(bug => {
      const date = new Date(bug.repportDate);
      return date >= startOfLastWeek && date <= endOfLastWeek;
    });

    this.lastMonthBugs = this.bugs.filter(bug => {
      const date = new Date(bug.repportDate);
      return date >= startOfLastMonth && date <= endOfLastMonth;
    });
  }

  toggleDescription(bugId: number | undefined): void {
    if (this.expandedBugId === bugId) {
      this.expandedBugId = null;
    } else {
      this.expandedBugId = bugId ?? null;
    }
  }

  refreshThisWeek(): void {}
  refreshLastWeek(): void {}
  refreshLastMonth(): void {}

  getThisWeekPaginated(): typeof this.bugs {
    const start = (this.thisWeekCurrentPage - 1) * this.thisWeekPageSize;
    return this.thisWeekBugs.slice(start, start + this.thisWeekPageSize);
  }

  getLastWeekPaginated(): typeof this.bugs {
    const start = (this.lastWeekCurrentPage - 1) * this.lastWeekPageSize;
    return this.lastWeekBugs.slice(start, start + this.lastWeekPageSize);
  }

  getLastMonthPaginated(): typeof this.bugs {
    const start = (this.lastMonthCurrentPage - 1) * this.lastMonthPageSize;
    return this.lastMonthBugs.slice(start, start + this.lastMonthPageSize);
  }

// Method to get the class for Status badges
  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'status-open';
      case 'fixed':
        return 'status-fixed';
      default:
        return 'badge-lg'; // Fallback
    }
  }

// Method to get the class for Source Issue badges
  getSourceIssueClass(sourceIssue: string): string {
    switch (sourceIssue?.toLowerCase()) {
      case 'alpha':
        return 'source-alpha';
      case 'support':
        return 'source-support';
      case 'in-house':
        return 'source-in-house';
      default:
        return 'badge-lg'; // Fallback
    }
  }

// Method to get the class for Priority badges
  getPriorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'medium':
        return 'priority-medium';
      case 'critical':
        return 'priority-critical';
      case 'high':
        return 'priority-high';
      default:
        return 'badge-lg'; // Fallback
    }
  }

  getDeveloperInfo(bug: any): string {
    if (bug?.developerFirstName && bug?.developerLastName) {
      return `${bug.developerFirstName} ${bug.developerLastName}`;
    }
    return 'N/A';
  }

  refreshAllBugs(): void {}

  getAllBugsPaginated(): typeof this.bugs {
    const start = (this.allBugsCurrentPage - 1) * this.allBugsPageSize;
    return this.bugs.slice(start, start + this.allBugsPageSize);
  }
}

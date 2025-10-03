import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { NonConformityDTO } from '@/app/core/models/nonconformance.model';
import { ObjectiveDTO } from '@/app/core/models/process.model';
import { ProcessService } from '@/app/services/process-service.service';
import { NonConformityService } from '@/app/services/non-conformity.service';
import { ObjectiveService } from '@/app/services/objective.service';

interface NotificationItem {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error';
  notificationType: 'objective' | 'non-conformity';
  objectiveId?: number;
  nonConformityId?: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NgbToastModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationComponent implements OnInit {
  notifications: NotificationItem[] = [];
  nonConformities: NonConformityDTO[] = [];
  objectives: ObjectiveDTO[] = [];

  constructor(
    private router: Router,
    private processService: ProcessService,
    private nonConformityService: NonConformityService,
    private objectiveService: ObjectiveService
  ) {}

  ngOnInit() {
    this.loadNonConformities();
    this.loadObjectives();
  }

  private async loadNonConformities() {
    try {
      const nonConformitiesObservable = await this.nonConformityService.getAllNonConformities();
      nonConformitiesObservable.subscribe({
        next: (data) => {
          this.nonConformities = data;
        },
        error: (error) => {
          console.error('Error loading non-conformities:', error);
        },
      });
    } catch (error) {
      console.error('Error in loadNonConformities:', error);
    }
  }

  private async loadObjectives() {
    try {
      const objectivesObservable = await this.objectiveService.getAllObjectives();
      objectivesObservable.subscribe({
        next: (data) => {
          this.objectives = data;
        },
        error: (error) => {
          console.error('Error loading objectives:', error);
        },
      });
    } catch (error) {
      console.error('Error in loadObjectives:', error);
    }
  }

  addNotification(
    message: string,
    type: 'info' | 'success' | 'error',
    notificationType: 'objective' | 'non-conformity',
    id?: number
  ) {
    const notification: NotificationItem = {
      id: Date.now(),
      message,
      type,
      notificationType,
      objectiveId: notificationType === 'objective' ? id : undefined,
      nonConformityId: notificationType === 'non-conformity' ? id : undefined,
    };
    this.notifications.push(notification);
  }

  navigateTo(notification: NotificationItem) {
    if (notification.notificationType === 'objective' && notification.objectiveId) {
      const objective = this.objectives.find((obj) => obj.idObjective === notification.objectiveId);
      if (objective) {
        this.router.navigate(['/dashboard/objective/details'], {
          queryParams: {
            id: notification.objectiveId,
            view: 'details',
          },
        }).then(() => {
          this.removeNotification(notification.id);
        });
      }
    } else if (notification.notificationType === 'non-conformity' && notification.nonConformityId) {
      const nonConformity = this.nonConformities.find((nc) => nc.idNonConformity === notification.nonConformityId);
      if (nonConformity) {
        this.router.navigate(['/dashboard/nonconformity/details'], {
          queryParams: {
            id: notification.nonConformityId,
            view: 'details',
          },
        }).then(() => {
          this.removeNotification(notification.id);
        });
      }
    }
  }

  removeNotification(id: number) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }
}

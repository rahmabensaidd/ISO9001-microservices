import { Component } from '@angular/core'
import { SummaryComponent } from './components/summary/summary.component'
import { TaskStateComponent } from './components/task-state/task-state.component'
import { TaskDetailComponent } from './components/task-detail/task-detail.component'

@Component({
  selector: 'app-task',
  imports: [SummaryComponent, TaskStateComponent, TaskDetailComponent],
  templateUrl: './task.component.html',
  standalone: true,
  styles: ``
})
export class TaskComponent {}

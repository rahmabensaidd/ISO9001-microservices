import { Component } from '@angular/core'
import { InviteMemberComponent } from './components/invite-member/invite-member.component'
import { KanbanTasksComponent } from './components/kanban-tasks/kanban-tasks.component'

@Component({
    selector: 'app-kanban-board',
    imports: [InviteMemberComponent, KanbanTasksComponent],
    templateUrl: './kanban-board.component.html',
    styles: ``
})
export class KanbanBoardComponent {}

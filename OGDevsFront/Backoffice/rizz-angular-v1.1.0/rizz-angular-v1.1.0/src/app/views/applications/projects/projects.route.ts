import { Route } from '@angular/router'
import { ClientsComponent } from './clients/clients.component'
import { TeamComponent } from './team/team.component'
//import { CreateComponent } from './create/create.component'
import { ProjectComponent } from './project/project.component'
import { TaskComponent } from './task/task.component'
import { UsersComponent } from './users/users.component'
import { KanbanBoardComponent } from './kanban-board/kanban-board.component'
import {ProjectslistComponent} from "@views/applications/projects/projectslist/projectslist.component";
import {MyworkComponent} from "@views/applications/projects/mywork/mywork.component";



export const PROJECTS_ROUTES: Route[] = [
  {
    path: 'clients',
    component: ClientsComponent,
    data: { title: 'Clients' },
  },
  /*{
    path: 'create',
    component: CreateComponent,
    data: { title: 'Create Project' },
  },*/
  {
    path: 'project',
    component: ProjectComponent,
    data: { title: 'Project' },
  },
  {
    path: 'task',
    component: TaskComponent,
    data: { title: 'Task' },
  },
  {
    path: 'users',
    component: UsersComponent,
    data: { title: 'Users' },
  },
  {
    path: 'kanban',
    component: KanbanBoardComponent,
    data: { title: 'Kanban' },
  },
  {
    path: 'team',
    component: TeamComponent,
    data: { title: 'Team' },
  },
  {
    path: 'projectslist',
    component: ProjectslistComponent,
    data: { title: 'projectslist' },
  },
  {
    path: 'mywork',
    component: MyworkComponent,
    data: { title: 'mywork' },
  },

]

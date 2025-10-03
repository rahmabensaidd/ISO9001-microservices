import { Route } from '@angular/router';
import { PosteManagementComponent } from "@views/applications/projects/poste-management/poste-management.component";
import { AuthGuard } from "@core/guards/auth.guard";
import { JobOffreComponent } from '@/app/views/applications/projects/job-offre/job-offre.component'
import {ProfileComponent} from "@views/applications/projects/profile/profile.component";
import {TrainingComponent} from "@/app/views/applications/projects/training/training.component";
import {InterviewComponent} from "@/app/views//applications/projects/interview/interview.component";
import {EvaluationComponent} from "@/app/views/applications/projects/evaluation/evaluation.component";
import {DataManagementComponent} from "@views/applications/projects/data/data-management.component";
import {ClientComponent} from "@views/dashboards/analytics/components/client/client.component"; //
import {MeetingManagementComponent} from "@views/applications/projects/meeting-management/meeting-management.component";
import {TaskOperationProcessComponent} from "@views/applications/projects/task-operation-process/task-operation-process.component";
import {TrainingsEmployeeComponent} from "@views/applications/projects/trainings-employee/trainings-employee.component";
import {ManageprojectComponent} from "@views/applications/projects/manageproject/manageproject.component";
import {ProjectslistComponent} from "@views/applications/projects/projectslist/projectslist.component";
import {MyworkComponent} from "@views/applications/projects/mywork/mywork.component";
import {KanbanProjectComponent} from "@views/applications/projects/kanbanproject/kanbanproject.component";
import {BugsfortaskComponent} from "@views/applications/projects/bugsfortask/bugsfortask.component";
import {BugsforallprojectComponent} from "@views/applications/projects/bugsforallproject/bugsforallproject.component";
import {ResourcesComponent} from "@views/applications/projects/resources/resources.component";
import {
  AfcDashboardComponentComponent
} from "@views/dashboards/ecommerce/afc-dashboard.component/afc-dashboard.component.component";
import {
  ProjetRequestAdminComponent
} from "@views/applications/projects/projet-request-admin/projet-request-admin.component";
import {
  ProjetRequestClientComponent
} from "@views/applications/projects/projet-request-client/projet-request-client.component";
import {
  ManagerContractsComponent
} from "@views/dashboards/analytics/components/manager-contracts/manager-contracts.component";
import {
  CustomerContractsComponent
} from "@views/dashboards/analytics/components/customer-contracts/customer-contracts.component";

import {UserManagmentComponent} from "@views/applications/projects/user-managment/user-managment.component";
import {ProjetcreateComponent} from "@views/applications/projects/projetcreate/projetcreate.component";

import {AuditCalendarComponent} from "@views/applications/projects/audit-calandar/audit-calendar.component";


import {
  IsoClausesComponentComponent
} from "@views/dashboards/analytics/components/iso-clauses-component/iso-clauses-component.component";
import {DashboardComponent} from "@views/applications/projects/dashboard/dashboard.component";
import {
  ObjectiveManagementComponent
} from "@views/dashboards/analytics/components/objective-management/objective-management.component";

import {NewChatbotComponent} from "@views/new-chatbot/new-chatbot.component";
import {StatistiquesComponent} from "@views/applications/projects/statistiques/statistiques.component";
import {
  ClientComponentComponent
} from "@views/dashboards/analytics/components/client-component/client-component.component";
import {AdminComponent} from "@views/dashboards/analytics/components/admin/admin.component";
import {ProjectsstatComponent} from "@views/applications/projects/projectsstat/projectsstat.component";
import {OcrComponent} from "@views/ocr/ocr.component";
import {
  WorkflowClassicCrudComponent
} from "@views/dashboards/analytics/components/workflow-classic-crud/workflow-classic-crud.component";
import {AuditComponent} from "@views/applications/projects/audit-component/audit.component";





export const VIEW_ROUTES: Route[] = [
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboards/dashboards.route').then(
        (mod) => mod.DASHBOARD_ROUTES
      ),
  },
  {
    path: 'apps',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./applications/apps.route').then((mod) => mod.APPS_ROUTES),
  },
  {
    path: 'ui',
    canActivate: [AuthGuard],
    loadChildren: () => import('./ui/ui.route').then((mod) => mod.UI_ROUTES),
  },
  {
    path: 'advanced',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./advance_ui/advance-ui.route').then(
        (mod) => mod.ADVANCED_ROUTES
      ),
  },
  {
    path: 'forms',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./forms/forms.route').then((mod) => mod.FORMS_ROUTES),
  },
  {
    path: 'charts',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./charts/charts.route').then((mod) => mod.CHARTS_ROUTES),
  },
  {
    path: 'tables',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./tables/tables.route').then((mod) => mod.TABLES_ROUTES),
  },
  {
    path: 'icons',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./icons/icons.route').then((mod) => mod.ICONS_ROUTES),
  },
  {
    path: 'maps',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./maps/maps.route').then((mod) => mod.MAPS_ROUTES),
  },
  {
    path: 'email-templates',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./email/email.route').then((mod) => mod.EMAIL_ROUTES),
  },
  {
    path: 'pages',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/pages.route').then((mod) => mod.PAGES_ROUTES),
  },
  { path: 'postes', canActivate: [AuthGuard], component: PosteManagementComponent },

  { path: 'data', canActivate: [AuthGuard], component: DataManagementComponent },
  { path: 'audits', canActivate: [AuthGuard], component: AuditCalendarComponent },
  { path: 'isoclauses', canActivate: [AuthGuard], component: IsoClausesComponentComponent },


  {path:'data', canActivate:[AuthGuard], component:DataManagementComponent},

  { path: 'audits', canActivate:[AuthGuard],component:AuditCalendarComponent},


  {path: 'isoclauses',canActivate:[AuthGuard], component:IsoClausesComponentComponent },
  {path: 'objective',canActivate:[AuthGuard], component:ObjectiveManagementComponent },
  {path: 'classicWorkflow',canActivate:[AuthGuard], component:WorkflowClassicCrudComponent},
  {path: 'upload',canActivate:[AuthGuard], component:AuditComponent},

  {
    path: 'tasks-operations-processes',
    canActivate: [AuthGuard],
    component: TaskOperationProcessComponent,
    data: { title: 'Tasks, Operations & Processes', mode: 'list' }
  },
  {
    path: 'tasks-operations-processes/:id',
    canActivate: [AuthGuard],
    component: TaskOperationProcessComponent,

    data: { title: 'Tasks, Operations & Processes', mode: 'details' } // Pass mode as data
  },

  {path:'client', canActivate:[AuthGuard], component:ClientComponent},
  { path: 'chatbot', canActivate: [AuthGuard], component: NewChatbotComponent },

{ path: 'meetings', canActivate: [AuthGuard], component: MeetingManagementComponent },


  { path: 'projectrequests', canActivate: [AuthGuard], component: ProjetRequestAdminComponent },
  { path: 'client/request', canActivate: [AuthGuard], component: ProjetRequestClientComponent },
  { path: 'afcdashoard', canActivate: [AuthGuard], component: AfcDashboardComponentComponent },
  { path: 'clientcontracts', canActivate: [AuthGuard], component: ManagerContractsComponent },
  { path: 'client/mycontracts', canActivate: [AuthGuard], component: CustomerContractsComponent },
  { path: 'client/mysurveys', canActivate: [AuthGuard], component: ClientComponentComponent },
  { path: 'adminsurveys', canActivate: [AuthGuard], component: AdminComponent },


  { path: 'financialdashboard', canActivate: [AuthGuard], component: DashboardComponent },



  {
    path: 'job-offers',
    component: JobOffreComponent,
    data: { title: 'Offres d\'Emploi' },
  },
  {
    path: 'about',
    component: JobOffreComponent,
    data: { title: 'about' },
  },
  {
    path: 'trainings',
    component: TrainingComponent,
    data: { title: 'Formations' },
  },
  {
    path: 'interviews',
    component: InterviewComponent,
    data: { title: 'Entretiens' },
  },
  {
    path: 'evaluations',
    component: EvaluationComponent,
    data: { title: 'Évaluations' },
  },
  {
    path: 'trainingsEmployee',
    component: TrainingsEmployeeComponent,
    data: { title: 'TrainingsEmployee' },
  },
  { path: 'manage_project/:id', canActivate: [AuthGuard], component: ManageprojectComponent },
  { path: 'projectslist', canActivate: [AuthGuard], component: ProjectslistComponent },
  { path: 'mywork', canActivate: [AuthGuard], component: MyworkComponent },
  { path: 'kanbanproject', canActivate: [AuthGuard], component: KanbanProjectComponent },
  { path: 'bugsfortask/:idtask', canActivate: [AuthGuard], component: BugsfortaskComponent },
  { path: 'bugsforallproject/:idproject', canActivate: [AuthGuard], component: BugsforallprojectComponent },
  { path: 'resources', canActivate: [AuthGuard], component: ResourcesComponent },
  { path: 'create-project', canActivate: [AuthGuard], component: ProjetcreateComponent },
  { path: 'user-management', canActivate: [AuthGuard], component: UserManagmentComponent },
  { path: 'ocr-management', canActivate: [AuthGuard], component: OcrComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profile' },
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profile' },
  },
  {
    path: 'stat',
    component: StatistiquesComponent,
    canActivate: [AuthGuard],
    data: { title: 'stat' },
  },

  {
    path: 'projectsstat',
    component: ProjectsstatComponent,
    canActivate: [AuthGuard],
    data: { title: 'projectsstat' },
  },
  {
    path: 'ocr',
    component: OcrComponent,
    canActivate: [AuthGuard],
    data: { title: 'Ocr' },
  },
];

import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout/layout.component';
import { Error404Component } from './views/auth/error404/error404.component';
import { Error500Component } from './views/auth/error500/error500.component';
import { MaintenanceComponent } from './views/auth/maintenance/maintenance.component';
import { AllTemplateFrontComponent } from '@/app/Frontoffice/all-template-front/all-template-front.component';
import { LoadingCompComponent } from '@/app/Frontoffice/loading-comp/loading-comp.component';
import { DASHBOARD_ROUTES } from './views/dashboards/dashboards.route';

// Assuming you have a HomeComponent for the default route
import { HomeComponent } from '@/app/Frontoffice/home.component/home.component';
import {AboutComponent} from "@/app/Frontoffice/about/about.component";
import {JobofferssComponent} from "@/app/Frontoffice/jobofferss/jobofferss.component";

export const routes: Routes = [
  // Front Office Routes
  {
    path: '',
    component: AllTemplateFrontComponent,
    children: [
      { path: '', component: HomeComponent }, // Default route loads HomeComponent
      { path: 'job-offerss', component: JobofferssComponent }, // Job Offers route
      { path: 'about', component: AboutComponent }, // Job Offers route


    ],
  },

  // Dashboard Routes
  {
    path: 'dashboard',
    children: DASHBOARD_ROUTES,
  },

  // Other Layout Routes
  {
    path: '',
    component: LayoutComponent,
    loadChildren: () =>
      import('./views/views.route').then((mod) => mod.VIEW_ROUTES),
  },

  // Auth Routes
  {
    path: 'auth',
    loadChildren: () =>
      import('./views/auth/auth.route').then((mod) => mod.AUTH_ROUTES),
  },

  // Maintenance Page
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    data: { title: 'Maintenance' },
  },

  // Error Pages
  {
    path: 'not-found',
    component: Error404Component,
    data: { title: '404 - Error' },
  },
  {
    path: 'error-500',
    component: Error500Component,
    data: { title: '500 - Error' },
  },

  // Wildcard Route
  {
    path: '**',
    redirectTo: 'not-found',
  },
];

import { Route } from '@angular/router';
import { AnalyticsComponent } from './analytics/analytics.component';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { BechirComponent } from './analytics/components/bechir/bechir.component'; // Assurez-vous du chemin correct
import { AuthGuard } from '@core/guards/auth.guard';
import {LayoutComponent} from "@/app/layouts/layout/layout.component";
// import {
//   WorkflowDesignerComponent
// } from "@views/dashboards/analytics/components/workflow-designer/workflow-designer.component";
import {KpiRcomponentComponent} from "@views/dashboards/ecommerce/kpi-rcomponent/kpi-rcomponent.component";
import {
  WorkflowDesignerComponent
} from "@views/dashboards/analytics/components/workflow-designer/workflow-designer.component";
import {
  NonConformanceComponent
} from "@views/dashboards/analytics/components/non-conformance/non-conformance.component";

import {KpiCalculationComponent} from "@views/dashboards/ecommerce/kpi-calculation/kpi-calculation.component"; // Assurez-vous que le chemin vers le guard est correct

import {
  IsoClausesComponentComponent
} from "@views/dashboards/analytics/components/iso-clauses-component/iso-clauses-component.component";
import {StatsComponent} from "@views/dashboards/ecommerce/stats/stats.component"; // Assurez-vous que le chemin vers le guard est correct


export const DASHBOARD_ROUTES: Route[] = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LayoutComponent,
    children: [
      {
        path: 'analytics',
        component: AnalyticsComponent,
        data: { title: 'Analytics' },
      },
      {
        path: 'ecommerce',
        component: EcommerceComponent,
        data: { title: 'Ecommerce' },
      },
      {
        path: 'bechir',
        component: BechirComponent,
        data: { title: 'Bechir' },
      },
      {
        path: 'dashreports',
        component: KpiRcomponentComponent,
        data: { title: 'dashboard-and-reports' },
      },
      {
        path: 'dashpredection',
        component: KpiCalculationComponent,
        data: { title: 'KPIS Calculation and P' },
      },
      {
        path: 'process',
        component: WorkflowDesignerComponent,
        data: { title: 'Process' },
      },

      {
        path: 'nonconformity',
        component: NonConformanceComponent,
        data: { title: 'NonConformity' },
      },
      {
        path: 'statmay',
        component: StatsComponent,
        data: { title: 'statmay' },
      },
      {
        path: 'nonconformity/details',
        component: NonConformanceComponent,
        data: { title: 'NonConformity Details' },
      },

      // Ajoutez d'autres routes protégées ici si nécessaire
    ],
  },
];

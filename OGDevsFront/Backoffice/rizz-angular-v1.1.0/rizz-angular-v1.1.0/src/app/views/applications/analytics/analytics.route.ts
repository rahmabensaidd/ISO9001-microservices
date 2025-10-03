import { Route } from '@angular/router'
import { CustomersComponent } from './customers/customers.component'
import { ReportsComponent } from './reports/reports.component'

export const ANALYTICS_ROUTES: Route[] = [
  {
    path: 'customers',
    component: CustomersComponent,
    data: { title: 'Customers' },
  },
  {
    path: 'reports',
    component: ReportsComponent,
    data: { title: 'Reports' },
  },
]

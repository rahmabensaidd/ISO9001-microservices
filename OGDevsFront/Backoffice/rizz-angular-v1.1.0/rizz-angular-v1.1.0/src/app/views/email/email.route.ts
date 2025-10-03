import { Route } from '@angular/router'
import { BasicComponent } from './basic/basic.component'
import { AlertComponent } from './alert/alert.component'
import { BillingComponent } from './billing/billing.component'

export const EMAIL_ROUTES: Route[] = [
  {
    path: 'basic',
    component: BasicComponent,
    data: { title: 'Basic Email' },
  },
  {
    path: 'alert',
    component: AlertComponent,
    data: { title: 'Alert Email' },
  },
  {
    path: 'billing',
    component: BillingComponent,
    data: { title: 'Billing Email' },
  },
]

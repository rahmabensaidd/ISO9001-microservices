import { Route } from '@angular/router'
import { ChatComponent } from './chat/chat.component'
import { ContactListComponent } from './contact-list/contact-list.component'
import { CalendarComponent } from './calendar/calendar.component'
import { InvoiceComponent } from './invoice/invoice.component'
import {ResumeFileComponent} from "@views/applications/invoice/resume-file/resume-file.component";
import {FilesComponent} from "@views/advance_ui/files/files.component";


export const APPS_ROUTES: Route[] = [
  {
    path: 'analytics',
    loadChildren: () =>
      import('./analytics/analytics.route').then((mod) => mod.ANALYTICS_ROUTES),
  },
  {
    path: 'projects',
    loadChildren: () =>
      import('./projects/projects.route').then((mod) => mod.PROJECTS_ROUTES),
  },
  {
    path: 'ecommerce',
    loadChildren: () =>
      import('./ecommerce/ecommerce.route').then((mod) => mod.ECOMMERCE_ROUTES),
  },
  {
    path: 'chat',
    component: ChatComponent,
    data: { title: 'Chat' },
  },
  {
    path: 'contacts',
    component: ContactListComponent,
    data: { title: 'Contact List' },
  },
  {
    path: 'calendar',
    component: CalendarComponent,
    data: { title: 'Calendar' },
  },
  {
    path: 'invoice',
    component: InvoiceComponent,
    data: { title: 'Invoice' },
  },
  {
    path: 'ResumeFile',
    component: ResumeFileComponent,
    data: { title: 'ResumeFile' },
  },
  {
    path: 'VersionFile',
    component: FilesComponent,
    data: { title: 'FilesComponent' },
  }
]

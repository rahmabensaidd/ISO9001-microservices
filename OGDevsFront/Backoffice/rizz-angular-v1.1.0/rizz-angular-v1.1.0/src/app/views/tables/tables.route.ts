import { Route } from '@angular/router'
import { BasicComponent } from './basic/basic.component'
import { DatatableComponent } from './datatable/datatable.component'

export const TABLES_ROUTES: Route[] = [
  {
    path: 'basic',
    component: BasicComponent,
    data: { title: 'Basic Table' },
  },
  {
    path: 'data-tables',
    component: DatatableComponent,
    data: { title: 'DataTable' },
  },
]

import { Route } from '@angular/router'
import { FontawesomeComponent } from './fontawesome/fontawesome.component'
import { LineawesomeComponent } from './lineawesome/lineawesome.component'
import { IcofontComponent } from './icofont/icofont.component'
import { IconoirComponent } from './iconoir/iconoir.component'

export const ICONS_ROUTES: Route[] = [
  {
    path: 'fa',
    component: FontawesomeComponent,
    data: { title: 'Font Awesome' },
  },
  {
    path: 'la',
    component: LineawesomeComponent,
    data: { title: 'Line Awesome' },
  },
  {
    path: 'icofont',
    component: IcofontComponent,
    data: { title: 'IcoFont' },
  },
  {
    path: 'iconoir',
    component: IconoirComponent,
    data: { title: 'IcoNoir' },
  },
]

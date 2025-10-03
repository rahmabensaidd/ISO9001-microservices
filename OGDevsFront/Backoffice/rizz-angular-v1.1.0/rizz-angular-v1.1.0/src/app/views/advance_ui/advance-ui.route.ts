import { Route } from '@angular/router'
import { AnimationComponent } from './animation/animation.component'
import { ClipboardComponent } from './clipboard/clipboard.component'
import { DragulaComponent } from './dragula/dragula.component'
import { FilesComponent } from './files/files.component'
import { HighlightComponent } from './highlight/highlight.component'
import { RangesliderComponent } from './rangeslider/rangeslider.component'
import { RatingsComponent } from './ratings/ratings.component'
import { RibbonsComponent } from './ribbons/ribbons.component'
import { SweetalertsComponent } from './sweetalerts/sweetalerts.component'
import { ToastsComponent } from './toasts/toasts.component'

export const ADVANCED_ROUTES: Route[] = [
  {
    path: 'animation',
    component: AnimationComponent,
    data: { title: 'Animation' },
  },
  {
    path: 'clipboard',
    component: ClipboardComponent,
    data: { title: 'Clipboard' },
  },
  {
    path: 'dragula',
    component: DragulaComponent,
    data: { title: 'Dragula' },
  },
  {
    path: 'file-manager',
    component: FilesComponent,
    data: { title: 'File Manager' },
  },
  {
    path: 'highlight',
    component: HighlightComponent,
    data: { title: 'Highlight' },
  },
  {
    path: 'range-slider',
    component: RangesliderComponent,
    data: { title: 'Range Slider' },
  },
  {
    path: 'ratings',
    component: RatingsComponent,
    data: { title: 'Ratings' },
  },
  {
    path: 'ribbons',
    component: RibbonsComponent,
    data: { title: 'Ribbons' },
  },
  {
    path: 'sweetalerts',
    component: SweetalertsComponent,
    data: { title: 'Sweet Alerts' },
  },
  {
    path: 'toasts',
    component: ToastsComponent,
    data: { title: 'Toasts' },
  },
]

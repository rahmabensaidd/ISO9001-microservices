import { Route } from '@angular/router'
import { AlertsComponent } from './alerts/alerts.component'
import { AvatarComponent } from './avatar/avatar.component'
import { ButtonsComponent } from './buttons/buttons.component'
import { BadgesComponent } from './badges/badges.component'
import { CardsComponent } from './cards/cards.component'
import { CarouselsComponent } from './carousels/carousels.component'
import { DropdownsComponent } from './dropdowns/dropdowns.component'
import { GridsComponent } from './grids/grids.component'
import { ImagesComponent } from './images/images.component'
import { ListComponent } from './list/list.component'
import { ModalsComponent } from './modals/modals.component'
import { NavsComponent } from './navs/navs.component'
import { NavbarComponent } from './navbar/navbar.component'
import { PaginationsComponent } from './paginations/paginations.component'
import { PopoverComponent } from './popover/popover.component'
import { ProgressComponent } from './progress/progress.component'
import { SpinnersComponent } from './spinners/spinners.component'
import { AccordionsComponent } from './accordions/accordions.component'
import { TypographyComponent } from './typography/typography.component'
import { VideosComponent } from './videos/videos.component'

export const UI_ROUTES: Route[] = [
  {
    path: 'alerts',
    component: AlertsComponent,
    data: { title: 'Alerts' },
  },
  {
    path: 'avatars',
    component: AvatarComponent,
    data: { title: 'Avatar' },
  },
  {
    path: 'buttons',
    component: ButtonsComponent,
    data: { title: 'Buttons' },
  },
  {
    path: 'badges',
    component: BadgesComponent,
    data: { title: 'Badges' },
  },
  {
    path: 'cards',
    component: CardsComponent,
    data: { title: 'Cards' },
  },
  {
    path: 'carousel',
    component: CarouselsComponent,
    data: { title: 'Carousels' },
  },
  {
    path: 'dropdowns',
    component: DropdownsComponent,
    data: { title: 'Dropdowns' },
  },
  {
    path: 'grids',
    component: GridsComponent,
    data: { title: 'Grids' },
  },
  {
    path: 'images',
    component: ImagesComponent,
    data: { title: 'Images' },
  },
  {
    path: 'list',
    component: ListComponent,
    data: { title: 'List' },
  },
  {
    path: 'modals',
    component: ModalsComponent,
    data: { title: 'Modals' },
  },
  {
    path: 'navs',
    component: NavsComponent,
    data: { title: 'Navs' },
  },
  {
    path: 'navbar',
    component: NavbarComponent,
    data: { title: 'Navbar' },
  },
  {
    path: 'paginations',
    component: PaginationsComponent,
    data: { title: 'Paginations' },
  },
  {
    path: 'popovers-tooltips',
    component: PopoverComponent,
    data: { title: 'Popover & Tooltips' },
  },
  {
    path: 'progress',
    component: ProgressComponent,
    data: { title: 'Progress' },
  },
  {
    path: 'spinners',
    component: SpinnersComponent,
    data: { title: 'Spinners' },
  },
  {
    path: 'tabs-accordion',
    component: AccordionsComponent,
    data: { title: 'Tabs & Accordions' },
  },
  {
    path: 'typography',
    component: TypographyComponent,
    data: { title: 'Typography' },
  },
  {
    path: 'videos',
    component: VideosComponent,
    data: { title: 'Videos' },
  },
]

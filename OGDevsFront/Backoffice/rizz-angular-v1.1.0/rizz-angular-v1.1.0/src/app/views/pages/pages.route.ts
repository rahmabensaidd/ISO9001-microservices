import { Route } from '@angular/router';
/*import { ProfileComponent } from './profile/profile.component';*/
import { NotificationsComponent } from './notifications/notifications.component';
import { TimelineComponent } from './timeline/timeline.component';
import { TreeviewComponent } from './treeview/treeview.component';
import { StarterComponent } from './starter/starter.component';
import { PricingComponent } from './pricing/pricing.component';
import { BlogsComponent } from './blogs/blogs.component';
import { FaqComponent } from './faq/faq.component';
import { GalleryComponent } from './gallery/gallery.component';
import {AuthGuard} from "@core/guards/auth.guard";

export const PAGES_ROUTES: Route[] = [
 /* {
    path: 'profile',
    component: ProfileComponent,
    data: { title: 'Profile' },
  },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    data: { title: 'Profile' },
  },*/
  {
    path: 'notifications',
    component: NotificationsComponent,
    data: { title: 'Notifications' },
  },
  {
    path: 'timeline',
    component: TimelineComponent,
    data: { title: 'Timeline' },
  },
  {
    path: 'treeview',
    component: TreeviewComponent,
    data: { title: 'TreeView' },
  },
  {
    path: 'starter',
    component: StarterComponent,
    data: { title: 'Starter' },
  },
  {
    path: 'pricing',
    component: PricingComponent,
    data: { title: 'Pricing' },
  },
  {
    path: 'blogs',
    component: BlogsComponent,
    data: { title: 'Blogs' },
  },
  {
    path: 'faqs',
    component: FaqComponent,
    data: { title: 'FAQ' },
  },
  {
    path: 'gallery',
    component: GalleryComponent,
    data: { title: 'Gallery' },
  },
];

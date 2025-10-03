import { Component } from '@angular/core'
import { AlertComponent } from './components/alert/alert.component'
import { NotificationDetailComponent } from './components/notification-detail/notification-detail.component'

@Component({
  selector: 'app-notifications',
  imports: [AlertComponent, NotificationDetailComponent],
  templateUrl: './notifications.component.html',
  standalone: true,
  styles: ``
})
export class NotificationsComponent {}

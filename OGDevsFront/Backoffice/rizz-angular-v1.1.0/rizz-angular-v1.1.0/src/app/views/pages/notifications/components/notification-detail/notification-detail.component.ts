import { Component } from '@angular/core'
import { notificationDetail } from '../../data'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-notification-detail',
  imports: [CommonModule],
  templateUrl: './notification-detail.component.html',
  standalone: true,
  styles: ``
})
export class NotificationDetailComponent {
  notificationDetailData = notificationDetail
}

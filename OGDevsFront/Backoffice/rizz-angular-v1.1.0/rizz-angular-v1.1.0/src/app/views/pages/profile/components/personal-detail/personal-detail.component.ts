import { Component, ViewEncapsulation } from '@angular/core'
import {
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap'
import { comments, lightbox } from '../../data'
import { CommonModule } from '@angular/common'
import { TobiiDirective } from '@/app/core/directive/tobii.directive'
import { credits, currentYear } from '@/app/common/constants'

@Component({
  selector: 'app-personal-detail',
  imports: [
    NgbDropdownModule,
    NgbTooltipModule,
    NgbNavModule,
    CommonModule,
    TobiiDirective,
  ],
  templateUrl: './personal-detail.component.html',
  styles: ``,
  standalone: true,
  encapsulation: ViewEncapsulation.None
})
export class PersonalDetailComponent {
  lightboxData = lightbox
  currentYear = currentYear
  commentData = comments
  credits = credits
  tags = ['Music', 'Animals', 'Natural', 'Food', 'Fashion', 'Helth', 'Charity']
}


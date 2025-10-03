import { Component } from '@angular/core'
import { VisitsList } from '../../data'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'analytics-total-visits',
    imports: [CommonModule],
    templateUrl: './total-visits.component.html',
    styles: ``
})
export class TotalVisitsComponent {
  visits = VisitsList
}

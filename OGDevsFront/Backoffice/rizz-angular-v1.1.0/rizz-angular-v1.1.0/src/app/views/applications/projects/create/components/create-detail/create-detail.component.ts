import { currentYear } from '@/app/common/constants'
import { Component } from '@angular/core'

@Component({
    selector: 'create-detail',
    imports: [],
    templateUrl: './create-detail.component.html',
    styles: ``
})
export class CreateDetailComponent {
  currentYear = currentYear
}

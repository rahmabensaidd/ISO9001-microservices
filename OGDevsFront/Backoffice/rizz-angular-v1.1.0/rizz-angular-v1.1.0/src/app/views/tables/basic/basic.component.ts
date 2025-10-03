import { currency } from '@/app/common/constants'
import { Component } from '@angular/core'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'app-basic',
    imports: [NgbDropdownModule],
    templateUrl: './basic.component.html',
    styles: ``
})
export class BasicComponent {
  currency = currency
}

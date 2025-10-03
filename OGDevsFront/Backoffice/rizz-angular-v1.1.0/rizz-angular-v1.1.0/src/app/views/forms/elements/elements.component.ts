import { credits, currency } from '@/app/common/constants'
import { Component } from '@angular/core'

@Component({
    selector: 'app-elements',
    imports: [],
    templateUrl: './elements.component.html',
    styles: ``
})
export class ElementsComponent {
  currency = currency
  credits = credits
}

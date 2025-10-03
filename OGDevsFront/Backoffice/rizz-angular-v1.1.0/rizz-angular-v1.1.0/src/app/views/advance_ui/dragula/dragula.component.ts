import { currency, currentYear } from '@/app/common/constants'
import { Component } from '@angular/core'
import { DragulaModule } from 'ng2-dragula'

@Component({
    selector: 'app-dragula',
    imports: [DragulaModule],
    templateUrl: './dragula.component.html',
    styles: ``
})
export class DragulaComponent {
  currency = currency
  currentYear = currentYear
}

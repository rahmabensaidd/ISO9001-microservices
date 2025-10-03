import { Component } from '@angular/core'
import { StateData } from '../../data'

@Component({
    selector: 'customer-details-state',
    imports: [],
    templateUrl: './state.component.html',
    styles: ``
})
export class StateComponent {
  stateList = StateData
}

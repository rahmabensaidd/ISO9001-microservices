import { Component } from '@angular/core'
import { UserProfileComponent } from './components/user-profile/user-profile.component'
import { StateComponent } from './components/state/state.component'
import { OrdersComponent } from './components/orders/orders.component'

@Component({
    selector: 'app-customer-details',
    imports: [UserProfileComponent, StateComponent, OrdersComponent],
    templateUrl: './customer-details.component.html',
    styles: ``
})
export class CustomerDetailsComponent {}

import { Component } from '@angular/core'
import { ClientCardComponent } from './component/client-card/client-card.component'
import { ClientsData } from './data'

@Component({
    selector: 'app-clients',
    imports: [ClientCardComponent],
    templateUrl: './clients.component.html',
    styles: ``
})
export class ClientsComponent {
  clientList = ClientsData
}

import { Component } from '@angular/core'
import { ContactFilterComponent } from './components/contact-filter/contact-filter.component'
import { ContactTableComponent } from './components/contact-table/contact-table.component'

@Component({
    selector: 'app-contact-list',
    imports: [ContactFilterComponent, ContactTableComponent],
    templateUrl: './contact-list.component.html',
    styles: ``
})
export class ContactListComponent {}

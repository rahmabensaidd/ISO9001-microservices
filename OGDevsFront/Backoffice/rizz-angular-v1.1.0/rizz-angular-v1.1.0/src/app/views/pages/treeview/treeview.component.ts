import { ListreeDirective } from '@/app/core/directive/listree.directive'
import { Component } from '@angular/core'

@Component({
    selector: 'app-treeview',
    imports: [ListreeDirective],
    templateUrl: './treeview.component.html',
    styles: ``
})
export class TreeviewComponent {}

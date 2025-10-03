import { Component } from '@angular/core'
import { NgbPopoverModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'app-popover',
    imports: [NgbPopoverModule, NgbTooltipModule],
    templateUrl: './popover.component.html',
    styles: ``
})
export class PopoverComponent {}

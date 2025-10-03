import { Component } from '@angular/core'
import { faqAccordionData, faqData } from './data'
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'app-faq',
    imports: [NgbAccordionModule],
    templateUrl: './faq.component.html',
    styles: ``
})
export class FaqComponent {
  faqData = faqData
  faqAccordionData = faqAccordionData
}

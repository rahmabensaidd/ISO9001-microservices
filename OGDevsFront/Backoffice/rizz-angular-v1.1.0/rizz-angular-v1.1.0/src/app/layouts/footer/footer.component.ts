import { Component } from '@angular/core'
import { credits, currentYear } from '../../common/constants'

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  standalone: true,
  styles: ``
})
export class FooterComponent {
  currentYear = currentYear;
  credits = credits
}

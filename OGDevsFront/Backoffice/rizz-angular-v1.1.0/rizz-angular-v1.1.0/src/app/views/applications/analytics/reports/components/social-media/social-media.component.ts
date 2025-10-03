import { Component } from '@angular/core'
import { SocialLinks } from '../../data'

@Component({
    selector: 'reports-social-media',
    imports: [],
    templateUrl: './social-media.component.html',
    styles: ``
})
export class SocialMediaComponent {
  socialData = SocialLinks
}

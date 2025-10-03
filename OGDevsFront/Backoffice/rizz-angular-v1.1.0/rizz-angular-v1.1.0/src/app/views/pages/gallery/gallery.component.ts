import { TobiiDirective } from '@/app/core/directive/tobii.directive'
import { Component } from '@angular/core'
@Component({
    selector: 'app-gallery',
    imports: [TobiiDirective],
    templateUrl: './gallery.component.html',
    styles: ``
})
export class GalleryComponent {
  gallaryBox = [
    'assets/images/extra/card/img-1.jpg',
    'assets/images/extra/card/img-2.jpg',
    'assets/images/extra/card/img-3.jpg',
    'assets/images/extra/card/img-4.jpg',
    'assets/images/extra/card/img-5.jpg',
    'assets/images/extra/card/img-6.jpg',
    'assets/images/extra/card/img-2.jpg',
    'assets/images/extra/card/img-1.jpg',
  ]
}

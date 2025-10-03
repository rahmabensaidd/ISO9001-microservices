import { MagicDirective } from '@/app/core/directive/magic.directive'
import { Component } from '@angular/core'
import { SimplebarAngularModule } from 'simplebar-angular'

@Component({
  selector: 'app-animation',
  imports: [MagicDirective, SimplebarAngularModule],
  templateUrl: './animation.component.html',
  standalone: true,
  styles: ``
})
export class AnimationComponent {}

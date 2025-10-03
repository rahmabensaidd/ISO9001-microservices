import { Component } from '@angular/core'
import { SimplebarAngularModule } from 'simplebar-angular'
import { activities, activities2 } from './data'

@Component({
    selector: 'app-timeline',
    imports: [SimplebarAngularModule],
    templateUrl: './timeline.component.html',
    styles: ``
})
export class TimelineComponent {
  activitiesData = activities
  activities2Data = activities2
}

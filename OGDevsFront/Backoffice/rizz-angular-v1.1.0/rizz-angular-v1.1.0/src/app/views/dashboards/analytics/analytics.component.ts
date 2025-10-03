import { Component } from '@angular/core'
import { StateComponent } from './components/state/state.component'
import { AudienceComponent } from './components/audience/audience.component'
import { VisitorsComponent } from './components/visitors/visitors.component'
import { BrowserComponent } from './components/browser/browser.component'
import { TotalVisitsComponent } from './components/total-visits/total-visits.component'
import { TrafficSourceComponent } from './components/traffic-source/traffic-source.component'
import { OrganicTrafficComponent } from './components/organic-traffic/organic-traffic.component'

@Component({
    selector: 'app-analytics',
    imports: [
        StateComponent,
        AudienceComponent,
        VisitorsComponent,
        BrowserComponent,
        TotalVisitsComponent,
        TrafficSourceComponent,
        OrganicTrafficComponent,
    ],
    templateUrl: './analytics.component.html',
    styles: ``
})
export class AnalyticsComponent {}

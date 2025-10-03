import { Component } from '@angular/core'
import { CountryComponent } from './components/country/country.component'
import { MetricsComponent } from './components/metrics/metrics.component'
import { VisitDetailsComponent } from './components/visit-details/visit-details.component'
import { SocialMediaComponent } from './components/social-media/social-media.component'

@Component({
    selector: 'app-reports',
    imports: [
        CountryComponent,
        MetricsComponent,
        VisitDetailsComponent,
        SocialMediaComponent,
    ],
    templateUrl: './reports.component.html',
    styles: ``
})
export class ReportsComponent {}

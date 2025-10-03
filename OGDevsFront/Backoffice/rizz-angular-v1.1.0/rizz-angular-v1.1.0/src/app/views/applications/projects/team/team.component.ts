import { Component } from '@angular/core'
import { TeamData } from './data'
import { TeamCardComponent } from './components/team-card/team-card.component'

@Component({
    selector: 'app-team',
    imports: [TeamCardComponent],
    templateUrl: './team.component.html',
    styles: ``
})
export class TeamComponent {
  teamList = TeamData
}

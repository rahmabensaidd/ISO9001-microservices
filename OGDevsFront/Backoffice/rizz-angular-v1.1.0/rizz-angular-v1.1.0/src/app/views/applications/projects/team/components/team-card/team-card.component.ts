import { Component, inject, Input } from '@angular/core'
import type { TeamType } from '../../data'
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { RouterLink } from '@angular/router'
import { UtilsService } from '@/app/core/service/utils.service'

@Component({
    selector: 'team-card',
    imports: [NgbProgressbarModule, CommonModule, RouterLink],
    templateUrl: './team-card.component.html',
    styles: ``
})
export class TeamCardComponent {
  @Input() team!: TeamType

  public service = inject(UtilsService)
}

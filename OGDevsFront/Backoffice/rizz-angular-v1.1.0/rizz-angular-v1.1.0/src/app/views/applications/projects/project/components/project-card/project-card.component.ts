import { Component, inject, Input } from '@angular/core'
import type { ProjectType } from '../../data'
import { NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { UtilsService } from '@/app/core/service/utils.service'
import { currency } from '@/app/common/constants'

@Component({
    selector: 'project-card',
    imports: [NgbProgressbarModule, CommonModule],
    templateUrl: './project-card.component.html',
    styles: ``
})
export class ProjectCardComponent {
  @Input() projects!: ProjectType
  currency = currency

  public service = inject(UtilsService)
}

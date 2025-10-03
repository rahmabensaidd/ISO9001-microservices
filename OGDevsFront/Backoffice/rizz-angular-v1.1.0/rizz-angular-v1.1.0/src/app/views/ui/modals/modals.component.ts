import { currentYear } from '@/app/common/constants'
import { SentenceCasePipe } from '@/app/core/helpers/sentence-case.pipe'
import { Component, inject, type TemplateRef } from '@angular/core'
import {
  NgbModal,
  NgbModalConfig,
  type NgbModalOptions,
} from '@ng-bootstrap/ng-bootstrap'

@Component({
    selector: 'app-modals',
    imports: [SentenceCasePipe],
    templateUrl: './modals.component.html',
    styles: ``
})
export class ModalsComponent {
  currentYear = currentYear
  private modalService = inject(NgbModal)
  variant!: string

  staticBackdrop(content: TemplateRef<any>) {
    this.modalService.open(content)
  }

  open(content: TemplateRef<any>) {
    this.modalService.open(content)
  }

  openModal(content: TemplateRef<HTMLElement>, options: NgbModalOptions) {
    this.modalService.open(content, options)
  }

  openVarientModal(content: TemplateRef<any>, variant: string) {
    this.variant = variant
    this.modalService.open(content, { fullscreen: variant })
  }
}

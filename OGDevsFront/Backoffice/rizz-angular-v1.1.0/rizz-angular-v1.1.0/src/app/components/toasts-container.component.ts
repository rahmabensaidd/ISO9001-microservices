import { Component, TemplateRef } from '@angular/core'
import { ToastService } from '../core/service/toast-service'
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap'

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [NgbToastModule],
  template: `
    @for (toast of toastService.toasts; track $index) {
      <ngb-toast
        [class]="toast.classname"
        [autohide]="true"
        [delay]="toast.delay || 5000"
        (hidden)="toastService.remove(toast)"
      >
        <ng-template [ngIf]="isTemplate(toast)" [ngIfElse]="text">
          <ng-template [ngTemplateOutlet]="toast.textOrTpl"></ng-template>
        </ng-template>

        <ng-template #text>{{ toast.textOrTpl }}</ng-template>
      </ngb-toast>
    }
  `,
  host: { '[class.ngb-toasts]': 'true' },
})
export class ToastsContainer {
  constructor(public toastService: ToastService) {}

  isTemplate(toast: { textOrTpl: any }) {
    return toast.textOrTpl instanceof TemplateRef
  }
}

import { Component } from '@angular/core'
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap'
import { ToastService } from '@/app/core/service/toast-service'
import { FormsModule } from '@angular/forms'

@Component({
    selector: 'app-toasts',
    imports: [NgbToastModule, FormsModule],
    templateUrl: './toasts.component.html',
    styles: ``
})
export class ToastsComponent {
  show = true
  translucent = true
  stacking = true
  stackingsecond = true
  placement = true
  contentToast = true
  content1Toast = true
  content2Toast = true
  customToast = true
  toastPlacement: string = ''

  constructor(public toastService: ToastService) {}
  /**
   * Standard message
   */
  showStandard() {
    this.toastService.show('Welcome Back! This is a Toast Notification', {
      classname: 'bg-primary text-center text-white',
      delay: 10000,
    })
  }

  /**
   * Success message
   */
  showSuccess() {
    this.toastService.show('Your application was successfully sent', {
      classname: 'bg-success text-center text-white',
      delay: 10000,
    })
  }

  /**
   * Danger message
   */
  showDanger() {
    this.toastService.show('Error ! An error occurred.', {
      classname: 'bg-danger text-center text-white',
      delay: 10000,
    })
  }

  /**
   * Warning message
   */
  showWarning() {
    this.toastService.show('Warning ! Something went wrong try again', {
      classname: 'bg-warning text-center text-white',
      delay: 10000,
    })
  }

  /**
   * Show Code Toggle
   */
  ShowCode(event: any) {
    let card = event.target.closest('.card')
    const preview = card.children[1].children[1]
    const codeView = card.children[1].children[2]
    if (codeView != null) {
      codeView.classList.toggle('d-none')
    }
    if (preview != null) {
      preview.classList.toggle('d-none')
    }
  }
}

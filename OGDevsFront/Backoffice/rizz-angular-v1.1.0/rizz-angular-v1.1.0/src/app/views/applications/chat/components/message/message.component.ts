import { Component, inject, Input, ViewChild } from '@angular/core'
import { MessageData, type ContactType } from '../../data'
import { CommonModule, DatePipe } from '@angular/common'
import {
  SimplebarAngularModule,
  type SimplebarAngularComponent,
} from 'simplebar-angular'
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
  type UntypedFormGroup,
} from '@angular/forms'

@Component({
  selector: 'chat-message',
  imports: [
    CommonModule,
    SimplebarAngularModule,
    NgbTooltipModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './message.component.html',
  standalone: true,
  styles: ``
})
export class MessageComponent {
  @Input() profileDetail!: ContactType
  formData!: UntypedFormGroup
  messageList = MessageData
  submitted = false

  public formBuilder = inject(UntypedFormBuilder)
  public datePipe = inject(DatePipe)
  @ViewChild('scrollRef', { static: false })
  scrollRef!: SimplebarAngularComponent

  ngOnInit(): void {
    // Validation
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    })
  }

  ngAfterViewInit() {
    this.scrollRef.SimpleBar.getScrollElement().scrollTop = 300
    this.onListScroll()
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.SimpleBar.getScrollElement().scrollTop =
          this.scrollRef.SimpleBar.getScrollElement().scrollHeight
      }, 100)
    }
  }

  messageSend() {
    const message = this.formData.get('message')!.value
    if (this.formData.valid && message) {
      this.messageList.push({
        id: this.messageList.length + 1,
        messages: [message],
        time: this.datePipe.transform(new Date(), 'shortTime')!,
        direction: 'right',
        userImage: 'assets/images/users/avatar-3.jpg',
      })
      setTimeout(() => {
        this.messageList.push({
          id: this.messageList.length + 1,
          messages: ['Hello'],
          time: this.datePipe.transform(new Date(), 'shortTime')!,
          direction: 'left',
          userImage: this.profileDetail.image,
        })
        this.onListScroll()
      }, 1000)
    } else {
      this.submitted = true
    }

    this.onListScroll()
    setTimeout(() => {
      this.formData.reset()
    }, 500)
  }
}

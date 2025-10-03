import { Component, EventEmitter, Output, type OnInit } from '@angular/core'
import { ContactList, type ContactType } from '../../data'
import { CommonModule } from '@angular/common'
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap'
import { SimplebarAngularModule } from 'simplebar-angular'

@Component({
  selector: 'chat-contact',
  imports: [CommonModule, NgbNavModule, SimplebarAngularModule],
  templateUrl: './chat-contact.component.html',
  standalone: true,
  styles: ``
})
export class ChatContactComponent implements OnInit {
  contactList = ContactList

  @Output() profileDetail = new EventEmitter<ContactType>()

  ngOnInit(): void {
    // Fetch Data
    const data = this.contactList[0]
    this.profileDetail.emit(data)
  }

  getDetail(user: ContactType) {
    const data = user
    this.profileDetail.emit(data)
  }
}

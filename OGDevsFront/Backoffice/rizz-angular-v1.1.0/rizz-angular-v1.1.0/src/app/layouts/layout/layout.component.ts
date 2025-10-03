import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VerticalComponent } from '../vertical/vertical.component';
import { Store } from '@ngrx/store';
import { NewChatbotService } from '../../services/new-chatbot.service';
import { NgbModal, NgbModalRef, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { NewChatbotComponent } from '@views/new-chatbot/new-chatbot.component';
import { ChatComponent } from '@views/applications/chat/chat.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-layout',
  imports: [
    RouterModule,
    VerticalComponent,
    NgbModalModule,
    NewChatbotComponent,
    ChatComponent,
    NgClass,
  ],
  templateUrl: './layout.component.html',
  standalone: true,
  styles: [`
    :host {
      position: relative;
      display: block;
      height: 100vh;
      width: 100vw;
    }

    .vertical-container {
      height: 100vh;
      overflow-y: auto;
      width: 100%;
    }

    #messenger-toggler {
      position: fixed;
      bottom: 90px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid #27AE60;
      background-color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, opacity 0.3s ease;
      z-index: 1000;
      user-select: none;
      -webkit-user-drag: none;
    }

    #messenger-toggler:hover {
      transform: scale(1.1);
    }

    #messenger-toggler.show-messenger {
      opacity: 0;
      pointer-events: none;
    }

    #messenger-toggler .messenger-logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .messenger-modal {
      max-width: 800px;
      width: 100%; /* Changé de 90% à 100% */
      max-height: 80vh;
      overflow-y: auto;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      box-sizing: border-box; /* Inclut padding et bordures dans la largeur */
    }

    .modal-body {
      padding: 0; /* Supprime le padding par défaut si présent */
      width: 100%;
      box-sizing: border-box; /* Inclut padding et bordures dans la largeur */
      overflow-y: auto; /* Conserve le défilement si nécessaire */
    }

    #messenger-modal-title {
      color: #07f36a; /* Vert pistache pour le titre de la modal */
    }

    /* Optionnel : Masquer la scrollbar visuellement (fonctionne sur WebKit) */
    .messenger-modal::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class LayoutComponent implements OnInit {
  @ViewChild('chatbotModal') chatbotModal: any;
  @ViewChild('messengerModal') messengerModal: any;

  layoutType: any;
  isChatbotOpen = false;
  isMessengerOpen = false;

  private store = inject(Store);
  private chatbotService = inject(NewChatbotService);
  private modalService = inject(NgbModal);
  private modalRef: NgbModalRef | null = null;
  private messengerModalRef: NgbModalRef | null = null;

  ngOnInit(): void {
    this.store.select('layout').subscribe((data) => {
      this.layoutType = data.LAYOUT;
      document.documentElement.setAttribute('data-bs-theme', data.LAYOUT_THEME);
      document.body.setAttribute('data-sidebar-size', data.MENU_SIZE);
      document.documentElement.setAttribute('data-startbar', data.STARTBAR_COLOR);
    });

    this.chatbotService.isChatbotOpen$.subscribe(isOpen => {
      this.isChatbotOpen = isOpen;
      if (isOpen && !this.modalRef) {
        this.openModal();
      } else if (!isOpen && this.modalRef) {
        this.closeModal();
      }
    });
  }

  toggleChatbotModal(): void {
    this.chatbotService.setChatbotOpen(!this.isChatbotOpen);
  }

  toggleMessengerModal(): void {
    this.isMessengerOpen = !this.isMessengerOpen;
    if (this.isMessengerOpen && !this.messengerModalRef) {
      this.openMessengerModal();
    } else if (!this.isMessengerOpen && this.messengerModalRef) {
      this.closeMessengerModal();
    }
  }

  private openModal(): void {
    this.modalRef = this.modalService.open(this.chatbotModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg',
      windowClass: 'chatbot-modal'
    });
    this.modalRef.result.finally(() => {
      this.closeModal();
    });
  }

  private closeModal(): void {
    if (this.modalRef) {
      this.modalRef.dismiss('Close click');
      this.modalRef = null;
      this.chatbotService.setChatbotOpen(false);
    }
  }

  private openMessengerModal(): void {
    this.messengerModalRef = this.modalService.open(this.messengerModal, {
      ariaLabelledBy: 'messenger-modal-title',
      size: 'lg',
      windowClass: 'messenger-modal'
    });
    this.messengerModalRef.result.finally(() => {
      this.closeMessengerModal();
    });
  }

  private closeMessengerModal(): void {
    if (this.messengerModalRef) {
      this.messengerModalRef.dismiss('Close click');
      this.messengerModalRef = null;
      this.isMessengerOpen = false;
    }
  }
}

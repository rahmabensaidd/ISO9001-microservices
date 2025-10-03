import { Component, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ChatService, ChatRoom, MessageDTO, MessageRequest, User, ChatRoomCreationRequest } from '@/app/services/chat.service';
import { KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule
  ],
  templateUrl: './chat.component.html',
  styles: [`
    :host {
      display: flex;
      height: 100vh;
      font-family: 'Inter', Arial, sans-serif;
      background-color: #f8f9fd;
    }

    .chat-container {
      display: flex;
      width: 100%;
      background-color: #f8f9fd;
    }

    .sidebar {
      width: 300px;
      border-right: 1px solid #e5e7eb;
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
      transition: width 0.3s ease;
    }

    .sidebar-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fafafa;
    }

    .sidebar-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
    }

    .search-bar {
      padding: 12px 20px;
      border-bottom: 1px solid #e5e7eb;
    }

    .search-bar input {
      width: 100%;
      padding: 8px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      background-color: #f9fafb;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .search-bar input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .search-bar input::placeholder {
      color: #9ca3af;
    }

    .room-list {
      flex: 1;
      overflow-y: auto;
    }

    .room-item {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid #e5e7eb;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .room-item:hover {
      background-color: #f3f4f6;
    }

    .room-item.active {
      background-color: #e6f0fa;
    }

    .room-item img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 12px;
      object-fit: cover;
      border: 1px solid #e5e7eb;
      transition: transform 0.2s;
    }

    .room-item img:hover {
      transform: scale(1.05);
    }

    .room-info {
      flex: 1;
      min-width: 0;
    }

    .room-info .room-name {
      font-size: 15px;
      font-weight: 500;
      color: #1f2937;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .room-info .last-message {
      font-size: 13px;
      color: #6b7280;
      margin: 2px 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: #f8f9fd;
    }

    .chat-header {
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #ffffff;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
    }

    .chat-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
    }

    .chat-header .actions {
      display: flex;
      gap: 12px;
    }

    .chat-header .actions button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      color: #6b7280;
      transition: color 0.2s, transform 0.2s;
    }

    .chat-header .actions button:hover {
      color: #3b82f6;
      transform: scale(1.1);
    }

    .chat-header .actions button:disabled {
      color: #d1d5db;
      cursor: not-allowed;
      transform: none;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background-color: #f8f9fd;
    }

    .message {
      display: flex;
      flex-direction: column;
      margin-bottom: 15px;
      align-items: flex-start;
      gap: 5px;
    }

    .message.received {
      align-items: flex-start;
    }

    .message.received .content {
      background-color: #ffffff;
      color: #1f2937;
      border-radius: 12px 12px 12px 0;
      padding: 10px 15px;
      max-width: 60%;
      font-size: 14px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: background-color 0.2s;
    }

    .message.received .content:hover {
      background-color: #f9fafb;
    }

    .message.sent {
      align-items: flex-end;
    }

    .message.sent .content {
      background-color: #3b82f6;
      color: white;
      border-radius: 12px 12px 0 12px;
      padding: 10px 15px;
      max-width: 60%;
      font-size: 14px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: background-color 0.2s;
    }

    .message.sent .content:hover {
      background-color: #2563eb;
    }

    .message .sender {
      font-weight: 600;
      font-size: 12px;
      color: #4b5563;
      background-color: #f1f5f9;
      padding: 3px 8px;
      border-radius: 10px;
      display: inline-block;
      margin-bottom: 5px;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.03);
      transition: background-color 0.2s;
    }

    .message.received .sender {
      color: #1f2937;
      background-color: #e2e8f0;
    }

    .message.sent .sender {
      display: none; /* Hide sender name for sent messages */
    }

    .message-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      margin-top: 5px;
    }

    .message .time {
      font-size: 11px;
      color: #9ca3af;
      display: block;
    }

    .message .seen {
      font-size: 11px;
      color: #3b82f6;
      display: block;
    }

    .message-actions {
      display: flex;
      gap: 6px;
      margin-top: 5px;
    }

    .icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      transition: color 0.2s, background-color 0.2s, transform 0.2s;
    }

    .icon-mark-read {
      color: #6b7280;
    }

    .icon-mark-read:hover {
      color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
      transform: scale(1.1);
    }

    .icon-delete {
      color: #6b7280;
    }

    .icon-delete:hover {
      color: #ef4444;
      background-color: rgba(239, 68, 68, 0.1);
      transform: scale(1.1);
    }

    .message-input {
      display: flex;
      padding: 15px 20px;
      border-top: 1px solid #e5e7eb;
      background-color: #ffffff;
      gap: 10px;
      box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.03);
    }

    .message-input input {
      flex: 1;
      padding: 10px 15px;
      border: 1px solid #e5e7eb;
      border-radius: 20px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .message-input input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .message-input input::placeholder {
      color: #9ca3af;
    }

    .message-input button {
      background-color: #3b82f6;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 10px 20px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s, transform 0.2s;
    }

    .message-input button:hover {
      background-color: #2563eb;
      transform: scale(1.02);
    }

    .message-input button:disabled {
      background-color: #93c5fd;
      cursor: not-allowed;
      transform: none;
    }

    .error-message {
      color: #ef4444;
      font-size: 14px;
      padding: 10px 20px;
      background-color: #fee2e2;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 15px;
      transition: opacity 0.3s ease;
    }

    .text-muted {
      color: #6b7280;
      font-size: 14px;
      text-align: center;
      padding: 20px;
      font-style: italic;
    }

    /* Modal-specific styles */
    .modal-header {
      background-color: #f8f9fd;
      border-bottom: 1px solid #e5e7eb;
      padding: 12px 20px;
    }

    .modal-title {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .modal-body {
      padding: 20px;
    }

    .modal-footer {
      border-top: 1px solid #e5e7eb;
      padding: 12px 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s, transform 0.2s;
    }

    .btn-primary:hover {
      background-color: #2563eb;
      transform: scale(1.02);
    }

    .btn-primary:disabled {
      background-color: #93c5fd;
      cursor: not-allowed;
      transform: none;
    }

    .btn-outline-danger {
      background-color: transparent;
      color: #ef4444;
      border: 1px solid #ef4444;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s, color 0.2s, transform 0.2s;
    }

    .btn-outline-danger:hover {
      background-color: #ef4444;
      color: white;
      transform: scale(1.02);
    }

    .btn-outline-danger:disabled {
      color: #f87171;
      border-color: #f87171;
      cursor: not-allowed;
      transform: none;
    }

    .form-control {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-control.is-invalid {
      border-color: #ef4444;
    }

    .form-select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-select:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .invalid-feedback {
      color: #ef4444;
      font-size: 12px;
      margin-top: 4px;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .sidebar {
        width: 250px;
      }

      .room-item img {
        width: 35px;
        height: 35px;
      }

      .room-info .room-name {
        font-size: 14px;
      }

      .room-info .last-message {
        font-size: 12px;
      }

      .chat-header h3 {
        font-size: 15px;
      }

      .message.received .content,
      .message.sent .content {
        max-width: 80%;
        font-size: 13px;
      }

      .message .sender {
        font-size: 11px;
        padding: 2px 6px;
      }

      .modal-body {
        padding: 15px;
      }

      .modal-title {
        font-size: 15px;
      }

      .btn-primary,
      .btn-outline-danger {
        font-size: 13px;
        padding: 5px 10px;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 200px;
      }

      .room-item img {
        width: 30px;
        height: 30px;
      }

      .room-info .room-name {
        font-size: 13px;
      }

      .room-info .last-message {
        font-size: 11px;
      }

      .chat-header h3 {
        font-size: 14px;
      }

      .message.received .content,
      .message.sent .content {
        max-width: 90%;
        font-size: 12px;
      }

      .message .sender {
        font-size: 10px;
        padding: 2px 5px;
      }

      .message-input input {
        font-size: 13px;
      }

      .message-input button {
        font-size: 13px;
        padding: 8px 16px;
      }

      .modal-body {
        padding: 10px;
      }

      .modal-title {
        font-size: 14px;
      }

      .btn-primary,
      .btn-outline-danger {
        font-size: 12px;
        padding: 4px 8px;
      }
    }
  `],
  standalone: true
})
export class ChatComponent implements OnInit, OnDestroy {
  chatRooms: ChatRoom[] = [];
  selectedRoom: ChatRoom | null = null;
  messages: MessageDTO[] = [];
  messageContent: string = '';
  userId: string | null = null;
  errorMessage: string | null = null;
  private messageSubscription: Subscription | null = null;

  // Properties for creating a room
  createRoomForm: FormGroup;
  submitted: boolean = false;
  allUsers: User[] = [];

  // Properties for editing a room
  editRoomForm: FormGroup;
  editSubmitted: boolean = false;

  constructor(
    private chatService: ChatService,
    private keycloakService: KeycloakService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.createRoomForm = this.fb.group({
      roomName: ['', Validators.required],
      userIds: [[]]
    });

    this.editRoomForm = this.fb.group({
      roomName: ['', Validators.required]
    });
  }

  private showSuccess(message: string): void {
    Swal.fire({
      title: 'Success!',
      text: message,
      icon: 'success',
      confirmButtonColor: '#5156be'
    });
  }

  private showError(message: string): void {
    Swal.fire({
      title: 'Error!',
      text: message,
      icon: 'error',
      confirmButtonColor: '#5156be'
    });
  }

  private async showWarningConfirm(message: string, confirmButtonText: string = 'Yes, proceed!'): Promise<boolean> {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'No, cancel!'
    });
    return result.isConfirmed;
  }

  async ngOnInit(): Promise<void> {
    try {
      const subject = await this.keycloakService.getKeycloakInstance().subject;
      this.userId = subject ?? null;
      if (this.userId) {
        console.log('👤 User ID:', this.userId);
        this.loadChatRooms();
        this.loadUsers();
      } else {
        this.showError('User not authenticated. Please log in.');
        console.error('❌ User not authenticated');
      }
    } catch (error) {
      this.showError('Failed to authenticate user. Please try again.');
      console.error('❌ Failed to get user ID:', error);
    }
  }

  ngOnDestroy(): void {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    this.chatService.disconnect();
  }

  loadChatRooms(): void {
    this.chatService.getChatRooms().subscribe({
      next: (rooms) => {
        console.log('🏠 Loaded chat rooms:', rooms);
        this.chatRooms = rooms;
        if (rooms.length === 0) {
          this.showInfo('No chat rooms available. Create a new room to start chatting.');
        } else if (!this.selectedRoom || !rooms.some(room => room.id === this.selectedRoom?.id)) {
          this.selectRoom(rooms[0]);
        }
        // Load last message for each room
        this.chatRooms.forEach(room => this.loadLastMessage(room.id));
      },
      error: (err) => {
        this.showError('Failed to load chat rooms. Please try again.');
        console.error('❌ Failed to load chat rooms:', err);
      }
    });
  }

  loadUsers(): void {
    this.chatService.getAllUsers().subscribe({
      next: (users) => {
        console.log('👥 Loaded users:', users);
        this.allUsers = users.filter(user => user.id !== this.userId);
      },
      error: (err) => {
        this.showError('Failed to load users. Please try again.');
        console.error('❌ Failed to load users:', err);
      }
    });
  }

  // Method to load the last message for a room
  loadLastMessage(roomId: number): void {
    this.chatService.getMessages(roomId).subscribe({
      next: (messages) => {
        const sortedMessages = messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;
        const roomIndex = this.chatRooms.findIndex(room => room.id === roomId);
        if (roomIndex !== -1) {
          this.chatRooms[roomIndex].lastMessage = lastMessage ? lastMessage.content : 'No messages yet';
          this.chatRooms = [...this.chatRooms]; // Trigger change detection
        }
      },
      error: (err) => {
        console.error('❌ Failed to load messages for room', roomId, ':', err);
      }
    });
  }

  openCreateRoomModal(content: TemplateRef<any>): void {
    this.submitted = false;
    this.createRoomForm.reset({ roomName: '', userIds: [] });
    this.modalService.open(content);
  }

  createRoom(): void {
    this.submitted = true;
    if (this.createRoomForm.valid) {
      const { roomName, userIds } = this.createRoomForm.value;
      const request: ChatRoomCreationRequest = {
        name: roomName,
        userIds: userIds || []
      };
      this.chatService.createChatRoom(request).subscribe({
        next: (room) => {
          console.log('🏠 Created room:', room);
          this.chatRooms = [...this.chatRooms, room];
          this.selectRoom(room);
          this.modalService.dismissAll();
          this.showSuccess('Chat room created successfully!');
        },
        error: (err) => {
          this.showError('Failed to create room. Please try again.');
          console.error('❌ Failed to create room:', err);
        }
      });
    } else {
      this.showError('Please fill all required fields.');
    }
  }

  openEditRoomModal(content: TemplateRef<any>): void {
    if (this.selectedRoom) {
      this.editSubmitted = false;
      this.editRoomForm.reset({ roomName: this.selectedRoom.name || '' });
      this.modalService.open(content);
    }
  }

  editRoom(): void {
    this.editSubmitted = true;
    if (this.editRoomForm.valid && this.selectedRoom) {
      const { roomName } = this.editRoomForm.value;
      const updatedRoom = { ...this.selectedRoom, name: roomName };
      this.chatService.editChatRoom(updatedRoom).subscribe({
        next: (room) => {
          console.log('🏠 Updated room:', room);
          this.chatRooms = this.chatRooms.map(r => r.id === room.id ? room : r);
          this.selectedRoom = room;
          this.modalService.dismissAll();
          this.showSuccess('Chat room updated successfully!');
        },
        error: (err) => {
          this.showError('Failed to update room. Please try again.');
          console.error('❌ Failed to update room:', err);
        }
      });
    } else {
      this.showError('Please enter a valid room name.');
    }
  }

  async deleteRoom(): Promise<void> {
    if (this.selectedRoom) {
      const confirmed = await this.showWarningConfirm(
        `This action cannot be undone for "${this.selectedRoom.name || 'Private Chat'}"!`,
        'Yes, delete it!'
      );
      if (confirmed) {
        this.chatService.deleteChatRoom(this.selectedRoom.id).subscribe({
          next: () => {
            console.log('🏠 Deleted room:', this.selectedRoom?.id);
            this.chatRooms = this.chatRooms.filter(room => room.id !== this.selectedRoom?.id);
            this.selectedRoom = null;
            this.messages = [];
            this.loadChatRooms();
            this.showSuccess('Chat room deleted successfully!');
          },
          error: (err) => {
            this.showError('Failed to delete room. Please try again.');
            console.error('❌ Failed to delete room:', err);
          }
        });
      }
    }
  }

  async leaveRoom(): Promise<void> {
    if (this.selectedRoom) {
      const confirmed = await this.showWarningConfirm(
        `You will no longer have access to "${this.selectedRoom.name || 'Private Chat'}"!`,
        'Yes, leave it!'
      );
      if (confirmed) {
        this.chatService.leaveChatRoom({ id: this.selectedRoom.id }).subscribe({
          next: () => {
            console.log('🏠 Left room:', this.selectedRoom?.id);
            this.chatRooms = this.chatRooms.filter(room => room.id !== this.selectedRoom?.id);
            this.selectedRoom = null;
            this.messages = [];
            this.loadChatRooms();
            this.showSuccess('You have left the chat room successfully!');
          },
          error: (err) => {
            this.showError('Failed to leave room. Please try again.');
            console.error('❌ Failed to leave room:', err);
          }
        });
      }
    }
  }

  selectRoom(room: ChatRoom): void {
    if (this.selectedRoom?.id !== room.id) {
      if (this.messageSubscription) {
        this.messageSubscription.unsubscribe();
      }
      this.selectedRoom = room;
      this.messages = [];
      this.errorMessage = null;
      console.log('🏠 Selected room:', room);
      this.loadMessages(room.id);
      this.messageSubscription = this.chatService.connect(room.id).subscribe({
        next: (message) => {
          console.log('📩 Adding message to UI:', message);
          const existingMessageIndex = this.messages.findIndex(msg => msg.id === message.id);
          if (existingMessageIndex !== -1) {
            this.messages[existingMessageIndex] = message;
          } else {
            this.messages = [...this.messages, message];
          }
          this.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          // Update last message in room list
          this.loadLastMessage(room.id);
        },
        error: (err) => {
          this.showError('WebSocket connection failed. Please try again.');
          console.error('❌ WebSocket error:', err);
        }
      });
    }
  }

  loadMessages(roomId: number): void {
    this.chatService.getMessages(roomId).subscribe({
      next: (messages) => {
        console.log('📩 Loaded messages for room', roomId, ':', messages);
        this.messages = messages;
        this.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      },
      error: (err) => {
        this.showError('Failed to load messages. Please try again.');
        console.error('❌ Failed to load messages:', err);
      }
    });
  }

  sendMessage(): void {
    if (this.messageContent.trim() && this.selectedRoom) {
      const messageRequest: MessageRequest = {
        chatRoomId: this.selectedRoom.id,
        message: this.messageContent
      };
      this.chatService.sendMessage(messageRequest).subscribe({
        next: () => {
          console.log('✅ Message sent successfully');
          this.messageContent = '';
          this.errorMessage = null;
        },
        error: (err) => {
          this.showError('Failed to send message. Please try again.');
          console.error('❌ Failed to send message:', err);
        }
      });
    } else {
      this.showError('Please select a room and enter a message.');
      console.warn('⚠️ No room selected or message empty');
    }
  }

  markAsRead(messageId: number): void {
    this.chatService.markMessageAsRead(messageId).subscribe({
      next: () => {
        console.log('✅ Message marked as read:', messageId);
        const message = this.messages.find(msg => msg.id === messageId);
        if (message) {
          message.seen = true;
          this.messages = [...this.messages];
        }
      },
      error: (err) => {
        this.showError('Failed to mark message as read. Please try again.');
        console.error('❌ Failed to mark message as read:', err);
      }
    });
  }

  async deleteMessage(messageId: number): Promise<void> {
    const confirmed = await this.showWarningConfirm(
      'This action cannot be undone!',
      'Yes, delete it!'
    );
    if (confirmed) {
      this.chatService.deleteMessage(messageId).subscribe({
        next: () => {
          console.log('✅ Message deleted:', messageId);
          this.messages = this.messages.filter(msg => msg.id !== messageId);
          // Update last message in room list
          if (this.selectedRoom) {
            this.loadLastMessage(this.selectedRoom.id);
          }
        },
        error: (err) => {
          this.showError('Failed to delete message. Please try again.');
          console.error('❌ Failed to delete message:', err);
        }
      });
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/fallback-avatar.png';
    console.warn('⚠️ Failed to load room avatar, using fallback image');
  }

  private showInfo(message: string): void {
    Swal.fire({
      title: 'Info',
      text: message,
      icon: 'info',
      confirmButtonColor: '#5156be'
    });
  }

  get createForm() {
    return this.createRoomForm.controls;
  }

  get editForm() {
    return this.editRoomForm.controls;
  }
}

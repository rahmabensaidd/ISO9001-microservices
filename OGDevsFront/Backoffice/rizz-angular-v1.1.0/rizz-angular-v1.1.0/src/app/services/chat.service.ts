import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface User {
  id: string;
  username: string;
  email?: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  users: User[];
  lastMessage?: string;
}

export interface ChatRoomDTO {
  id: number;
  name?: string;
  userIds?: string[];
}

export interface MessageDTO {
  id: number;
  chatRoomId: number;
  chatRoomName: string | null;
  senderId: string;
  senderUsername: string;
  content: string;
  attachment: string | null;
  createdAt: string;
  seen: boolean;
}

export interface MessageRequest {
  chatRoomId: number;
  message: string;
}

export interface ChatRoomCreationRequest {
  name: string;
  userIds: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = 'http://localhost:8089';
  private stompClient: Client | null = null;
  private messageSubject = new Subject<MessageDTO>();
  private pendingMessages: { request: MessageRequest; observer: any }[] = [];
  private isConnecting: boolean = false;
  private token: string | null = null;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getSecureToken(): Promise<string> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        await this.keycloakService.login();
        throw new Error('User not logged in, redirected to login');
      }

      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      if (!token) {
        throw new Error('No token available after refresh');
      }

      console.log('🔑 Token retrieved successfully:', token.substring(0, 20) + '...');
      this.token = token;
      return token;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      this.token = null;
      console.warn('⚠️ Token refresh failed, redirecting to Keycloak login.');
      await this.keycloakService.logout();
      await this.keycloakService.login();
      throw new Error('Token refresh failed, redirected to login');
    }
  }

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.getSecureToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  connect(chatRoomId: number): Observable<MessageDTO> {
    return new Observable<MessageDTO>(observer => {
      this.getSecureToken().then(token => {
        if (!token) {
          observer.error(new Error('No valid token available'));
          this.isConnecting = false;
          return;
        }

        if (this.stompClient && this.stompClient.connected) {
          console.log('🔗 WebSocket already connected, subscribing to room:', chatRoomId);
          this.subscribeToRoom(chatRoomId, observer, token);
          return;
        }

        if (this.isConnecting) {
          console.log('⏳ WebSocket connection in progress, waiting...');
          setTimeout(() => this.subscribeToRoom(chatRoomId, observer, token), 500);
          return;
        }

        this.isConnecting = true;
        console.log('🔗 Initiating WebSocket connection...');

        const sockJsFactory = () => new SockJS(`${this.apiUrl}/ws?access_token=${encodeURIComponent(token)}`);
        this.stompClient = new Client({
          webSocketFactory: sockJsFactory,
          reconnectDelay: 5000,
          debug: (str) => console.log('🔍 STOMP Debug:', str),
          connectHeaders: { 'Authorization': `Bearer ${token}` }
        });

        this.stompClient.onConnect = (frame) => {
          console.log('✅ WebSocket connected:', frame);
          this.isConnecting = false;
          this.subscribeToRoom(chatRoomId, observer, token);
          this.flushPendingMessages(token);
        };

        this.stompClient.onStompError = (error) => {
          console.error('❌ STOMP error:', error);
          this.isConnecting = false;
          observer.error(new Error(`STOMP error: ${error}`));
        };

        this.stompClient.onWebSocketError = async (error) => {
          console.error('❌ WebSocket error:', error);
          this.isConnecting = false;
          if (error.message && error.message.includes('401')) {
            console.warn('⚠️ Unauthorized error, redirecting to login...');
            await this.keycloakService.logout();
            await this.keycloakService.login();
          }
          observer.error(new Error(`WebSocket error: ${error}`));
        };

        this.stompClient.onWebSocketClose = async (event) => {
          console.log('🔌 WebSocket closed:', event);
          this.isConnecting = false;
          console.log('🔄 Attempting to reconnect WebSocket...');
          this.connect(chatRoomId).subscribe(observer);
        };

        console.log('🚀 Activating STOMP client for room:', chatRoomId);
        this.stompClient.activate();
      }).catch(error => {
        console.error('❌ Failed to initialize WebSocket:', error);
        this.isConnecting = false;
        observer.error(error);
      });
    });
  }

  private subscribeToRoom(chatRoomId: number, observer: any, token: string) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('❌ Cannot subscribe, STOMP client not connected');
      observer.error(new Error('STOMP client not connected'));
      return;
    }

    const destination = `/room/messages/${chatRoomId}`;
    console.log('📥 Subscribing to:', destination);
    this.stompClient.subscribe(
      destination,
      (message) => {
        if (message.body) {
          try {
            const msg: MessageDTO = JSON.parse(message.body);
            console.log('📩 Received message:', msg);
            this.messageSubject.next(msg);
            observer.next(msg);
          } catch (error) {
            console.error('❌ Failed to parse message:', error);
          }
        } else {
          console.warn('⚠️ Received empty message body');
        }
      },
      { 'Authorization': `Bearer ${token}` }
    );
  }

  disconnect(): void {
    if (this.stompClient) {
      console.log('🔌 Disconnecting WebSocket');
      this.stompClient.deactivate().then(() => {
        console.log('✅ WebSocket disconnected');
      }).catch(error => {
        console.error('❌ Error during disconnection:', error);
      });
      this.stompClient = null;
      this.isConnecting = false;
      this.pendingMessages = [];
      this.token = null;
    }
  }

  private flushPendingMessages(token: string): void {
    if (this.stompClient?.connected) {
      while (this.pendingMessages.length > 0) {
        const { request, observer } = this.pendingMessages.shift()!;
        console.log('📤 Sending pending message:', request);
        try {
          this.stompClient!.publish({
            destination: '/chat/send',
            body: JSON.stringify(request),
            headers: { 'Authorization': `Bearer ${token}` }
          });
          observer.next();
          observer.complete();
        } catch (error) {
          console.error('❌ Failed to send pending message:', error);
          observer.error(error);
        }
      }
    }
  }

  sendMessage(message: MessageRequest): Observable<void> {
    return new Observable<void>(observer => {
      if (!this.stompClient || this.isConnecting) {
        console.warn('⏳ STOMP client not ready, queuing message:', message);
        this.pendingMessages.push({ request: message, observer });
        return;
      }

      if (!this.stompClient.connected) {
        console.warn('⏳ STOMP client not connected, queuing message:', message);
        this.pendingMessages.push({ request: message, observer });
        return;
      }

      this.getSecureToken().then(token => {
        if (!token) {
          observer.error(new Error('No valid token available'));
          return;
        }
        console.log('📤 Publishing message:', message);
        this.stompClient!.publish({
          destination: '/chat/send',
          body: JSON.stringify(message),
          headers: { 'Authorization': `Bearer ${token}` }
        });
        observer.next();
        observer.complete();
      }).catch(error => {
        console.error('❌ Failed to send message:', error);
        observer.error(error);
      });
    });
  }

  getChatRooms(): Observable<ChatRoom[]> {
    return new Observable<ChatRoom[]>(observer => {
      this.getHeaders().then(headers => {
        this.http.get<ChatRoom[]>(`${this.apiUrl}/chat/rooms`, { headers }).subscribe({
          next: (response) => {
            console.log('🏠 Chat rooms fetched:', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to fetch chat rooms:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for chat rooms:', error);
        observer.error(error);
      });
    });
  }

  getLastMessages(chatRoomIds: number[]): Observable<MessageDTO[]> {
    return new Observable<MessageDTO[]>(observer => {
      this.getHeaders().then(headers => {
        const params = chatRoomIds.map(id => `chatRoomIds=${id}`).join('&');
        this.http.get<MessageDTO[]>(`${this.apiUrl}/chat/rooms/last?${params}`, { headers }).subscribe({
          next: (response) => {
            console.log('📩 Last messages fetched:', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to fetch last messages:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for last messages:', error);
        observer.error(error);
      });
    });
  }

  getMessages(roomId: number): Observable<MessageDTO[]> {
    return new Observable<MessageDTO[]>(observer => {
      this.getHeaders().then(headers => {
        this.http.get<MessageDTO[]>(`${this.apiUrl}/chat/rooms/${roomId}/messages`, { headers }).subscribe({
          next: (response) => {
            console.log('📩 Messages fetched for room', roomId, ':', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to fetch messages for room', roomId, ':', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for messages:', error);
        observer.error(error);
      });
    });
  }

  createChatRoom(request: ChatRoomCreationRequest): Observable<ChatRoom> {
    return new Observable<ChatRoom>(observer => {
      this.getHeaders().then(headers => {
        this.http.post<ChatRoom>(`${this.apiUrl}/chat/rooms/create`, request, { headers }).subscribe({
          next: (response) => {
            console.log('🏠 Chat room created:', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to create chat room:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for create room:', error);
        observer.error(error);
      });
    });
  }

  joinChatRoom(chatRoom: Partial<ChatRoom>): Observable<ChatRoom> {
    return new Observable<ChatRoom>(observer => {
      this.getHeaders().then(headers => {
        this.http.post<ChatRoom>(`${this.apiUrl}/chat/rooms/join`, chatRoom, { headers }).subscribe({
          next: (response) => {
            console.log('🏠 Joined chat room:', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to join chat room:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for join room:', error);
        observer.error(error);
      });
    });
  }

  leaveChatRoom(chatRoom: Partial<ChatRoom>): Observable<void> {
    // Simplify payload to avoid serialization issues
    const payload: ChatRoomDTO = {
      id: chatRoom.id!
    };
    return new Observable<void>(observer => {
      this.getHeaders().then(headers => {
        console.log('📤 Sending leave room request with payload:', JSON.stringify(payload, null, 2));
        console.log('📤 Headers:', headers);
        this.http.post<void>(`${this.apiUrl}/chat/rooms/leave`, payload, { headers }).subscribe({
          next: () => {
            console.log('🏠 Left chat room:', chatRoom.id);
            observer.next();
          },
          error: (error) => {
            console.error('❌ Failed to leave chat room:', error);
            if (error.status === 415) {
              console.error('⚠️ 415 Unsupported Media Type: Check Content-Type and payload');
              console.error('⚠️ Sent headers:', headers);
              console.error('⚠️ Sent payload:', JSON.stringify(payload, null, 2));
            }
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for leave room:', error);
        observer.error(error);
      });
    });
  }

  editChatRoom(chatRoom: ChatRoom): Observable<ChatRoom> {
    // Simplify payload to avoid serialization issues
    const payload: ChatRoomDTO = {
      id: chatRoom.id,
      name: chatRoom.name,
      userIds: chatRoom.users?.map(user => user.id)
    };
    return new Observable<ChatRoom>(observer => {
      this.getHeaders().then(headers => {
        console.log('📤 Sending edit room request with payload:', JSON.stringify(payload, null, 2));
        console.log('📤 Headers:', headers);
        this.http.put<ChatRoom>(`${this.apiUrl}/chat/rooms`, payload, { headers }).subscribe({
          next: (response) => {
            console.log('🏠 Chat room updated:', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to update chat room:', error);
            if (error.status === 415) {
              console.error('⚠️ 415 Unsupported Media Type: Check Content-Type and payload');
              console.error('⚠️ Sent headers:', headers);
              console.error('⚠️ Sent payload:', JSON.stringify(payload, null, 2));
            }
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for edit room:', error);
        observer.error(error);
      });
    });
  }

  deleteChatRoom(roomId: number): Observable<void> {
    return new Observable<void>(observer => {
      this.getHeaders().then(headers => {
        this.http.delete<void>(`${this.apiUrl}/chat/rooms/${roomId}`, { headers }).subscribe({
          next: () => {
            console.log('🏠 Chat room deleted:', roomId);
            observer.next();
          },
          error: (error) => {
            console.error('❌ Failed to delete chat room:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for delete room:', error);
        observer.error(error);
      });
    });
  }

  markMessageAsRead(messageId: number): Observable<void> {
    return new Observable<void>(observer => {
      this.getHeaders().then(headers => {
        this.http.post<void>(`${this.apiUrl}/chat/messages/mark-as-read/${messageId}`, null, { headers }).subscribe({
          next: () => {
            console.log('📩 Message marked as read:', messageId);
            observer.next();
          },
          error: (error) => {
            console.error('❌ Failed to mark message as read:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for mark as read:', error);
        observer.error(error);
      });
    });
  }

  deleteMessage(messageId: number): Observable<void> {
    return new Observable<void>(observer => {
      this.getHeaders().then(headers => {
        this.http.delete<void>(`${this.apiUrl}/chat/messages/${messageId}`, { headers }).subscribe({
          next: () => {
            console.log('📩 Message deleted:', messageId);
            observer.next();
          },
          error: (error) => {
            console.error('❌ Failed to delete message:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for delete message:', error);
        observer.error(error);
      });
    });
  }

  getAllUsers(): Observable<User[]> {
    return new Observable<User[]>(observer => {
      this.getHeaders().then(headers => {
        this.http.get<User[]>(`${this.apiUrl}/chat/users`, { headers }).subscribe({
          next: (response) => {
            console.log('👥 Users fetched:', response);
            observer.next(response);
          },
          error: (error) => {
            console.error('❌ Failed to fetch users:', error);
            observer.error(error);
          },
          complete: () => observer.complete()
        });
      }).catch(error => {
        console.error('❌ Failed to get headers for users:', error);
        observer.error(error);
      });
    });
  }
}

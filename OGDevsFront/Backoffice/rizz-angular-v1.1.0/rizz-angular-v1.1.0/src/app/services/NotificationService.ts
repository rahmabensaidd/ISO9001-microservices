import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import { Client as StompClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { SweetAlertService } from './sweet-alert.service';

export interface ProcessNotification {
  id: number;
  message: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  private apiUrl = 'http://localhost:8089/ws';
  private stompClient: StompClient | null = null;
  private processNotificationsSubject = new BehaviorSubject<ProcessNotification[]>([]);
  private auditNotificationsSubject = new BehaviorSubject<ProcessNotification[]>([]);
  private connectionStatusSubject = new BehaviorSubject<string>('disconnected');
  public processNotifications$: Observable<ProcessNotification[]> = this.processNotificationsSubject.asObservable();
  public auditNotifications$: Observable<ProcessNotification[]> = this.auditNotificationsSubject.asObservable();
  public connectionStatus$: Observable<string> = this.connectionStatusSubject.asObservable();
  private reconnectInterval: any;
  private reconnectDelay = 5000;
  private backoffFactor = 1.5;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private isConnecting = false;

  constructor(
    private keycloakService: KeycloakService,
    private sweetAlertService: SweetAlertService
  ) {
    this.initializeWebSocketConnection();
  }

  async initializeWebSocketConnection(): Promise<void> {
    if (this.isConnecting || (this.stompClient && this.stompClient.connected)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;
    this.connectionStatusSubject.next('connecting');
    this.reconnectAttempts = 0;

    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        this.sweetAlertService.showWarning('User not logged in. Redirecting to login...');
        await this.keycloakService.login();
        this.isConnecting = false;
        this.connectionStatusSubject.next('disconnected');
        return;
      }

      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token for WebSocket:', token);

      const wsUrlWithToken = `${this.apiUrl}?access_token=${encodeURIComponent(token)}`;
      const socket = new SockJS(wsUrlWithToken);
      this.stompClient = new StompClient({
        webSocketFactory: () => socket,
        debug: (str) => console.log(str),
      });

      this.stompClient.onConnect = () => {
        console.log('✅ WebSocket connected');
        this.connectionStatusSubject.next('connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.subscribeToNotifications();
      };

      this.stompClient.onStompError = (frame) => {
        console.error('❌ WebSocket STOMP error:', frame);
        this.connectionStatusSubject.next('disconnected');
        this.isConnecting = false;
        this.handleError(new Error('STOMP protocol error'), 'WebSocket connection error');
        this.handleReconnection();
      };

      this.stompClient.onWebSocketClose = (event) => {
        console.error('❌ WebSocket closed:', event);
        this.connectionStatusSubject.next('disconnected');
        this.isConnecting = false;
        this.handleReconnection();
      };

      this.stompClient.activate();
    } catch (error) {
      this.handleError(error, 'Error initializing WebSocket');
      this.connectionStatusSubject.next('disconnected');
      this.isConnecting = false;
      this.handleReconnection();
    }
  }

  private subscribeToNotifications(): void {
    if (!this.stompClient || !this.stompClient.connected) {
      console.warn('Cannot subscribe: WebSocket client not connected');
      return;
    }

    this.stompClient.subscribe('/room/notifications', (message) => {
      try {
        const notificationMessage = message.body;
        const idMatch = notificationMessage.match(/ID: (\d+)/);
        const id = idMatch ? parseInt(idMatch[1], 10) : 0;

        if (!idMatch) {
          console.warn('⚠️ Could not parse ID from notification:', notificationMessage);
        }

        const notification: ProcessNotification = {
          id,
          message: notificationMessage,
          timestamp: new Date(),
        };

        if (notificationMessage.toLowerCase().includes('audit')) {
          const currentAuditNotifications = this.auditNotificationsSubject.getValue();
          this.auditNotificationsSubject.next([...currentAuditNotifications, notification]);
          console.log('📩 Received audit notification:', notification);
          this.sweetAlertService.showInfo('New Audit Notification: ' + notification.message);
        } else {
          const currentProcessNotifications = this.processNotificationsSubject.getValue();
          this.processNotificationsSubject.next([...currentProcessNotifications, notification]);
          console.log('📩 Received process notification:', notification);
          this.sweetAlertService.showInfo('New Process Notification: ' + notification.message);
        }
      } catch (error) {
        this.handleError(error, 'Error processing notification');
      }
    });
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnect attempts reached. Giving up.');
      this.sweetAlertService.showError('Unable to reconnect to WebSocket after multiple attempts.');
      this.connectionStatusSubject.next('failed');
      return;
    }

    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
    }

    const delay = this.reconnectDelay * Math.pow(this.backoffFactor, this.reconnectAttempts);
    this.reconnectInterval = setTimeout(() => {
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
      this.reconnectAttempts++;
      this.initializeWebSocketConnection();
    }, delay);
  }

  private handleError(error: unknown, context: string): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ ${context}:`, error);
    this.sweetAlertService.showError(`${context}: ${errorMessage}`);
  }

  disconnect(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.stompClient) {
      this.stompClient.deactivate();
      console.log('✅ WebSocket disconnected');
      this.connectionStatusSubject.next('disconnected');
      this.stompClient = null;
      this.isConnecting = false;
    }
  }

  clearProcessNotifications(): void {
    this.processNotificationsSubject.next([]);
    console.log('🗑️ Process notifications cleared');
  }

  clearAuditNotifications(): void {
    this.auditNotificationsSubject.next([]);
    console.log('🗑️ Audit notifications cleared');
  }

  getConnectionStatus(): Observable<string> {
    return this.connectionStatus$;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.clearProcessNotifications();
    this.clearAuditNotifications();
  }
}

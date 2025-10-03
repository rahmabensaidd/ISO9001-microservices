import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class NewChatbotService {
  private apiUrl = 'http://localhost:8089/api/new-chatbot';
  private isChatbotOpenSubject = new BehaviorSubject<boolean>(false);
  isChatbotOpen$: Observable<boolean> = this.isChatbotOpenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token:', token);

      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  async sendMessage(message: string): Promise<Observable<{ response: string, error: string | null }>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));
    if (!message.trim()) return throwError(() => new Error('Message cannot be empty'));

    return this.http.post<{ response: string, error: string }>(this.apiUrl, { message }, { headers })
      .pipe(
        map(response => {
          let cleanedResponse = response.response || '';
          cleanedResponse = cleanedResponse.replace(/\r\n/g, '\n');
          if (!message.match(/code|program|python|algorithm|function|script/i)) {
            cleanedResponse = cleanedResponse.replace(/```python\n[\s\S]*?\n```/g, '').trim();
          } else {
            const codeBlocks = cleanedResponse.match(/```python\n[\s\S]*?\n```/g);
            if (codeBlocks) {
              const uniqueCodeBlocks = [...new Set(codeBlocks)];
              const nonCodeParts = cleanedResponse.split(/```python\n[\s\S]*?\n```/);
              cleanedResponse = nonCodeParts[0];
              if (uniqueCodeBlocks.length > 0) {
                cleanedResponse += '\n' + uniqueCodeBlocks.join('\n');
              }
            }
          }
          cleanedResponse = cleanedResponse.split('.')[0] + '.';
          return {
            response: cleanedResponse,
            error: response.error
          };
        }),
        catchError(error => {
          const errorMessage = error.statusText
            ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
            : `Error: ${error.message || 'Unknown error'}`;
          console.error('❌ Error calling chatbot API:', errorMessage);
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  setChatbotOpen(isOpen: boolean): void {
    this.isChatbotOpenSubject.next(isOpen);
  }
}

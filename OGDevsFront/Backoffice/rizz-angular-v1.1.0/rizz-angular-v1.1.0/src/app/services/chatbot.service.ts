import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
export interface ChatbotResponse {
  non_conformity_id?: string;
  source?: string;
  type?: string;
  iso_clause?: string;
  solution?: string;
  message?: string;
  error?: string;
}


@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = 'http://localhost:8000'; // URL of your chatbot backend
  private Url = 'http://localhost:8000/query'; // URL of your chatbot backend
  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  // Get secure token from Keycloak
  private async getSecureToken(): Promise<string | null> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('⚠️ User not logged in, redirecting to Keycloak.');
        await this.keycloakService.login();
        return null;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      return token;
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return null;
    }
  }
  private async getHeadersforKhalil(): Promise<HttpHeaders | undefined> {
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
  async sendQuery(query: string): Promise<Observable<ChatbotResponse>> {
    const headers = await this.getHeadersforKhalil();
    if (!headers) {
      return throwError(() => new Error('User not authenticated'));
    }

    const body = { query };

    return this.http.post<ChatbotResponse>(this.Url, body, { headers }).pipe(
      catchError((error) => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || error.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error sending query to chatbot:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Set headers with token
  private getHeaders(): Observable<HttpHeaders> {
    return from(this.getSecureToken()).pipe(
      switchMap(token => {
        if (!token) {
          throw new Error('User not logged in or invalid token');
        }
        return [new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        })];
      })
    );
  }

  // Capture voice input using Web Speech API
  captureVoiceInput(): Promise<string> {
    return new Promise((resolve, reject) => {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionConstructor) {
        reject(new Error('Speech Recognition API not supported in this browser'));
        return;
      }

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'fr-FR'; // Set language to French
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('🎙️ Parle maintenant...');
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        console.log(`📝 Tu as dit : ${transcript}`);
        resolve(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❗ Erreur de reconnaissance vocale :', event.error);
        reject(new Error('Speech recognition error: ' + event.error));
      };

      recognition.onend = () => {
        console.log('🎙️ Reconnaissance vocale terminée.');
      };

      recognition.start();
    });
  }

  // Send a text question to the chatbot
  sendTextQuestion(question: string): Observable<any> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<any>(`${this.apiUrl}/chat/text`, { query: question }, { headers })
      ),
      catchError(error => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error sending text question to chatbot:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Trigger a voice interaction with the chatbot
  sendVoiceQuestion(): Observable<any> {
    return from(this.captureVoiceInput()).pipe(
      switchMap(query => {
        if (!query) {
          throw new Error('No voice input captured');
        }
        return this.getHeaders().pipe(
          switchMap(headers =>
            this.http.post<any>(`${this.apiUrl}/chat/voice`, { query }, { headers })
          )
        );
      }),
      catchError(error => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error sending voice question to chatbot:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Speak the response using Web Speech API (client-side)
  speakResponse(text: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(voice => voice.lang.includes('fr')) || voices.find(voice => voice.lang.includes('en'));
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = text.toLowerCase().includes('fr') ? 'fr-FR' : 'en-US';
    window.speechSynthesis.speak(utterance);
  }
}

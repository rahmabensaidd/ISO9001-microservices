import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

// Interface for the request payload
interface ChatRequest {
  query: string;
  mode: string; // 'p' for speak, 'e' for text
}

// Interface for the response from the backend
export interface ChatResponse {
  response: string;
  query: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotAlaService {
  private apiUrl = 'http://localhost:8000'; // Base URL of the chatbot backend

  constructor(private http: HttpClient) {}

  // Send a text question to the chatbot
  sendTextQuestion(question: string): Observable<ChatResponse> {
    const payload: ChatRequest = { query: question, mode: 'e' };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat/text`, payload, { headers }).pipe(
      catchError(error => {
        const errorMessage = error.statusText
          ? `HTTP ${error.status}: ${error.statusText} - ${error.error?.error || 'Unknown error'}`
          : `Error: ${error.message || 'Unknown error'}`;
        console.error('❌ Error sending text question to chatbot:', errorMessage);
        return throwError(() => new Error(errorMessage));
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

  // Send a voice question to the chatbot
  sendVoiceQuestion(): Observable<ChatResponse> {
    return from(this.captureVoiceInput()).pipe(
      switchMap(query => {
        if (!query) {
          throw new Error('No voice input captured');
        }
        const payload: ChatRequest = { query, mode: 'p' };
        const headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        return this.http.post<ChatResponse>(`${this.apiUrl}/chat/voice`, payload, { headers });
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

  // Unified method to send queries (for compatibility with existing TrainingsEmployeeComponent)
  sendQuery(query: string, mode: string): Observable<ChatResponse> {
    if (mode === 'e') {
      return this.sendTextQuestion(query);
    } else if (mode === 'p') {
      return this.sendVoiceQuestion();
    } else {
      return throwError(() => new Error('Invalid mode: must be "e" or "p"'));
    }
  }
}

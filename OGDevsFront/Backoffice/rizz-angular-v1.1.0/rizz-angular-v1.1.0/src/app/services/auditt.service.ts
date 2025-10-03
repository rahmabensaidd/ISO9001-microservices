import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environment/environment';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  uploadFile(file: File): Observable<{ filename: string; fileSize: number; textPreview: string; suggestions: string[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ filename: string; fileSize: number; textPreview: string; suggestions: string[] }>(`${this.apiUrl}/upload`, formData);
  }

  saveNonConformity(data: { nonConformity: string; aiSuggestions: string[]; correctionProposals: string[] }): Observable<void> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
          });
    return this.http.post<void>(`${this.apiUrl}/save`, data, { headers });
  }
}

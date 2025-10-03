import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Meeting, MeetingRequest } from '@core/models/meeting.model';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private apiUrl = 'http://localhost:8089/api';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30); // Refresh token if expiring within 30 seconds
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token:', token);
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  async createMeeting(meetingRequest: MeetingRequest): Promise<Observable<Meeting>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post<Meeting>(`${this.apiUrl}/create-meeting`, meetingRequest, { headers }).pipe(
      catchError(err => {
        console.error('Error creating meeting:', err);
        return throwError(() => err);
      })
    );
  }

  async getAllMeetings(): Promise<Observable<Meeting[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Meeting[]>(`${this.apiUrl}/meetings`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching meetings:', err);
        return throwError(() => err);
      })
    );
  }

  async getMeetingById(id: number): Promise<Observable<Meeting>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Meeting>(`${this.apiUrl}/meetings/${id}`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching meeting by ID:', err);
        return throwError(() => err);
      })
    );
  }

  async updateMeeting(id: number, meeting: Meeting): Promise<Observable<Meeting>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put<Meeting>(`${this.apiUrl}/meetings/${id}`, meeting, { headers }).pipe(
      catchError(err => {
        console.error('Error updating meeting:', err);
        return throwError(() => err);
      })
    );
  }

  async deleteMeeting(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const url = `${this.apiUrl}/meetings/${id}`;
    console.log('Sending DELETE request to:', url);
    return this.http.delete<void>(url, { headers }).pipe(
      catchError(err => {
        console.error('Error deleting meeting:', err);
        return throwError(() => err);
      })
    );
  }

  async assignUserToMeeting(meetingId: number, userId: string): Promise<Observable<Meeting>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post<Meeting>(`${this.apiUrl}/meetings/${meetingId}/assign-user/${userId}`, {}, { headers }).pipe(
      catchError(err => {
        console.error('Error assigning user to meeting:', err);
        return throwError(() => err);
      })
    );
  }

  async getMeetingsByUserId(userId: string): Promise<Observable<Meeting[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Meeting[]>(`${this.apiUrl}/meetings/user/${userId}`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching meetings by user ID:', err);
        return throwError(() => err);
      })
    );
  }

  async updateMeetingStatus(meetingId: number, newStatus: string): Promise<Observable<Meeting>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put<Meeting>(`${this.apiUrl}/meetings/${meetingId}/status?newStatus=${newStatus}`, {}, { headers }).pipe(
      catchError(err => {
        console.error('Error updating meeting status:', err);
        return throwError(() => err);
      })
    );
  }

  async getMeetingsByCurrentUser(): Promise<Observable<Meeting[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Meeting[]>(`${this.apiUrl}/current-user`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching meetings for current user:', err);
        return throwError(() => err);
      })
    );
  }
}

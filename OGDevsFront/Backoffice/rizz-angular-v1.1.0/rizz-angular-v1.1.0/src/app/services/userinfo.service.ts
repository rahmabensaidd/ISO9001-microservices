import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';

export interface UserProfile {
  birthdate?: string;
  position?: string;
  education?: string;
  languages?: string;
  phoneNumber?: string;
  email?: string;
  username?: string;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserInfoService {
  private apiUrl = 'http://localhost:8089/api/users';

  constructor(private http: HttpClient, private keycloakService: KeycloakService) {}

  private async getHeaders(): Promise<HttpHeaders> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        throw new Error('User not authenticated');
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      console.log('Keycloak Token:', token);
      if (!token) throw new Error('Token is null or empty');
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      throw error;
    }
  }

  async getProfilePhoto(userId: string): Promise<Observable<Blob>> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/${userId}/profile-photo`, { headers, responseType: 'blob' }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error fetching profile photo';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only access your own profile photo';
        } else if (err.status === 404) {
          errorMessage = 'No profile photo available';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error fetching profile photo:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async uploadProfilePhoto(userId: string, file: File): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    const formData = new FormData();
    formData.append('file', file);

    const uploadHeaders = headers.delete('Content-Type', 'application/json');

    return this.http.post(`${this.apiUrl}/${userId}/profile-photo`, formData, { headers: uploadHeaders, responseType: 'json' }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error uploading profile photo';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only upload your own profile photo';
        } else if (err.status === 400) {
          errorMessage = err.error?.error || 'Invalid file or request';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error uploading profile photo:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    return this.http.put(`${this.apiUrl}/${userId}/profile`, profile, { headers, responseType: 'text' }).pipe(
      map(response => response as string),
      retry(1),
      catchError((err: HttpErrorResponse) => {
        console.error('Error updating user profile:', err);
        const errorMessage = err.error instanceof Object ? JSON.stringify(err.error) : err.error || err.message;
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getUserProfile(userId: string): Promise<Observable<UserProfile>> {
    const headers = await this.getHeaders();
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}/profile`, { headers }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error fetching user profile';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only access your own profile';
        } else if (err.status === 404) {
          errorMessage = 'User profile not found';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error fetching user profile:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async searchUsers(query: string): Promise<Observable<UserSummary[]>> {
    if (!query || query.trim() === '') {
      console.warn('Search query is empty');
      return throwError(() => new Error('Search query cannot be empty'));
    }

    const headers = await this.getHeaders();
    return this.http.get<UserSummary[]>(`${this.apiUrl}/search?query=${encodeURIComponent(query)}`, { headers }).pipe(
      map(users => users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber
      }))),
      retry(1),
      catchError((err: HttpErrorResponse) => {
        console.error('Error searching users:', err);
        const errorMessage = err.error instanceof Object ? JSON.stringify(err.error) : err.error || err.message;
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getFollowers(userId: string): Promise<Observable<UserSummary[]>> {
    const headers = await this.getHeaders();
    return this.http.get<UserSummary[]>(`${this.apiUrl}/${userId}/followers`, { headers }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error fetching followers';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only access your own followers';
        } else if (err.status === 404) {
          errorMessage = 'User not found';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error fetching followers:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async getFollowing(userId: string): Promise<Observable<UserSummary[]>> {
    const headers = await this.getHeaders();
    return this.http.get<UserSummary[]>(`${this.apiUrl}/${userId}/following`, { headers }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error fetching following';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only access your own following list';
        } else if (err.status === 404) {
          errorMessage = 'User not found';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error fetching following:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async followUser(userId: string, followedId: string): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl}/${userId}/follow/${followedId}`, {}, { headers, responseType: 'text' }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error following user';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only perform actions for your own account';
        } else if (err.status === 400) {
          errorMessage = err.error || 'Invalid request';
        } else if (err.status === 404) {
          errorMessage = 'User not found';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error following user:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  async unfollowUser(userId: string, followedId: string): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    return this.http.delete(`${this.apiUrl}/${userId}/unfollow/${followedId}`, { headers, responseType: 'text' }).pipe(
      retry(1),
      catchError((err: HttpErrorResponse) => {
        let errorMessage = 'Error unfollowing user';
        if (err.status === 401) {
          errorMessage = 'Unauthorized: Invalid or expired token';
        } else if (err.status === 403) {
          errorMessage = 'Forbidden: You can only perform actions for your own account';
        } else if (err.status === 400) {
          errorMessage = err.error || 'Invalid request';
        } else if (err.status === 404) {
          errorMessage = 'User not found';
        } else {
          errorMessage = `Error ${err.status}: ${err.message}`;
        }
        console.error('Error unfollowing user:', err);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

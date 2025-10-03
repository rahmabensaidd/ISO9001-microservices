import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { ContractClient } from '@core/models/contract-client.model';

@Injectable({
  providedIn: 'root'
})
export class ContractClientService {
  private apiUrl = 'http://localhost:8089/api/contracts';
  private faceRecognitionApiUrl = 'http://localhost:8000/face-recognition/verify';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30);
      const token = await this.keycloakService.getToken();
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
    } catch (error) {
      console.error('Error fetching headers:', error);
      return undefined;
    }
  }

  async createContract(contract: ContractClient): Promise<Observable<ContractClient>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.post<ContractClient>(this.apiUrl, contract, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error creating contract:', error);
        return throwError(() => error);
      })
    );
  }

  async getAllContracts(): Promise<Observable<ContractClient[]>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.get<ContractClient[]>(this.apiUrl, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error fetching all contracts:', error);
        return throwError(() => error);
      })
    );
  }

  async getContractsByCurrentUser(): Promise<Observable<ContractClient[]>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.get<ContractClient[]>(`${this.apiUrl}/current-user`, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error fetching user contracts:', error);
        return throwError(() => error);
      })
    );
  }

  async getContractsByStatus(): Promise<Observable<{ [key: string]: number }>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/stats/by-status`, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error fetching contracts by status:', error);
        return throwError(() => error);
      })
    );
  }

  async getContractsByClient(): Promise<Observable<{ [key: string]: number }>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/stats/by-client`, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error fetching contracts by client:', error);
        return throwError(() => error);
      })
    );
  }

  async getContractsByEcheance(startDate: string, endDate: string): Promise<Observable<ContractClient[]>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.get<ContractClient[]>(`${this.apiUrl}/stats/by-echeance?startDate=${startDate}&endDate=${endDate}`, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error fetching contracts by echeance:', error);
        return throwError(() => error);
      })
    );
  }

  async analyzeContractsPerformance(): Promise<Observable<{ [key: number]: { averageScore: number; alert: string; scoreHistory: { date: string; score: number }[] } }>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.get<{ [key: number]: { averageScore: number; alert: string; scoreHistory: { date: string; score: number }[] } }>(`${this.apiUrl}/performance`, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error analyzing contracts performance:', error);
        return throwError(() => error);
      })
    );
  }

  async updateContract(id: number, payload: { signature: string | null } | ContractClient): Promise<Observable<ContractClient>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    const updatePayload = 'signature' in payload ? payload : { signature: payload.signature ?? null };
    console.log('Sending update payload:', updatePayload, 'Type:', typeof payload);
    return this.http.put<ContractClient>(`${this.apiUrl}/${id}`, updatePayload, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error updating contract:', error);
        return throwError(() => error);
      })
    );
  }

  async deleteContract(id: number): Promise<Observable<void>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      catchError((error: any) => {
        console.error('Error deleting contract:', error);
        return throwError(() => error);
      })
    );
  }

  async verifyFace(image: string, userId: string): Promise<Observable<{ verified: boolean; distance?: number; threshold?: number }>> {
    const headers = await this.getHeaders();
    if (!headers) {
      return throwError(() => new Error('Authentication failed'));
    }
    const payload = { images: [image], userId };
    const updatedHeaders = headers.set('Content-Type', 'application/json');
    return this.http.post<{ verified: boolean; distance?: number; threshold?: number }>(
      this.faceRecognitionApiUrl,
      payload,
      { headers: updatedHeaders }
    ).pipe(
      catchError((error: any) => {
        console.error('verifyFace: Error during face verification', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la vérification faciale';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

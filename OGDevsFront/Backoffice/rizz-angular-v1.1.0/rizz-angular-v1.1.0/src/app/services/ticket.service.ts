// src/app/services/ticket.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Ticket } from '@core/models/ticket.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:8089/api/tickets'; // Ajustez selon votre backend

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  // Gestion des headers avec vérification d'authentification et refresh du token
  private async getHeaders(): Promise<HttpHeaders | undefined> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User not logged in, redirecting to Keycloak.");
        await this.keycloakService.login();
        return undefined;
      }
      await this.keycloakService.updateToken(30); // Refresh si le token expire bientôt
      const token = await this.keycloakService.getToken();
      console.log('✅ Retrieved token:', token);
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json' // Forcer le backend à renvoyer du JSON
      });
    } catch (error) {
      console.error('❌ Error retrieving token:', error);
      return undefined;
    }
  }

  // Récupérer tous les tickets (ROLE_CLIENT par défaut)
  async getAllTickets(): Promise<Observable<Ticket[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Ticket[]>(this.apiUrl, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching tickets:', err);
        return throwError(() => err);
      })
    );
  }

  // Récupérer tous les tickets pour ROLE_ADMIN
  async getAllTicketsForAdmin(): Promise<Observable<Ticket[]>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.get<Ticket[]>(`${this.apiUrl}/admin/all`, { headers }).pipe(
      catchError(err => {
        console.error('Error fetching all tickets for admin:', err);
        return throwError(() => err);
      })
    );
  }

  // Créer un ticket
  async createTicket(ticket: Ticket): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.post<string>(this.apiUrl, ticket, { headers }).pipe(
      catchError(err => {
        console.error('Error creating ticket:', err);
        return throwError(() => err);
      })
    );
  }

  // Mettre à jour un ticket (ROLE_CLIENT ou ROLE_ADMIN, selon l'endpoint)
  async updateTicket(id: number, ticket: Ticket): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put<string>(`${this.apiUrl}/${id}`, ticket, { headers }).pipe(
      catchError(err => {
        console.error('Error updating ticket:', err);
        return throwError(() => err);
      })
    );
  }

  // Mettre à jour un ticket pour ROLE_ADMIN
  async updateTicketForAdmin(id: number, ticket: Ticket): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    return this.http.put<string>(`${this.apiUrl}/admin/${id}`, ticket, { headers }).pipe(
      catchError(err => {
        console.error('Error updating ticket for admin:', err);
        return throwError(() => err);
      })
    );
  }

  // Supprimer un ticket (ROLE_CLIENT ou ROLE_ADMIN, selon l'endpoint)
  async deleteTicket(id: number): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const url = `${this.apiUrl}/${id}`;
    console.log('Sending DELETE request to:', url);
    return this.http.delete<string>(url, { headers }).pipe(
      catchError(err => {
        console.error('Error deleting ticket:', err);
        return throwError(() => err);
      })
    );
  }

  // Supprimer un ticket pour ROLE_ADMIN
  async deleteTicketForAdmin(id: number): Promise<Observable<string>> {
    const headers = await this.getHeaders();
    if (!headers) return throwError(() => new Error('User not authenticated'));

    const url = `${this.apiUrl}/admin/${id}`;
    console.log('Sending DELETE request to:', url);
    return this.http.delete<string>(url, { headers }).pipe(
      catchError(err => {
        console.error('Error deleting ticket for admin:', err);
        return throwError(() => err);
      })
    );
  }
}

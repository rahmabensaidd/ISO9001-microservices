// src/app/services/data.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Data } from '@/app/core/models/data.model';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:8089/data';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private async getHeaders(): Promise<HttpHeaders> {
    const token = await this.keycloakService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  addData(data: Data): Observable<Data> {
    return new Observable<Data>(observer => {
      this.getHeaders().then(headers => {
        this.http.post<Data>(this.apiUrl, data, { headers }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }

  getAllData(): Observable<Data[]> {
    return new Observable<Data[]>(observer => {
      this.getHeaders().then(headers => {
        this.http.get<Data[]>(this.apiUrl, { headers }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }

  getDataById(id: number): Observable<Data> {
    return new Observable<Data>(observer => {
      this.getHeaders().then(headers => {
        this.http.get<Data>(`${this.apiUrl}/${id}`, { headers }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }

  updateData(id: number, data: Data): Observable<Data> {
    return new Observable<Data>(observer => {
      this.getHeaders().then(headers => {
        this.http.put<Data>(`${this.apiUrl}/${id}`, data, { headers }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }

  deleteData(id: number): Observable<string> {
    return new Observable<string>(observer => {
      this.getHeaders().then(headers => {
        this.http.delete(`${this.apiUrl}/${id}`, { headers, responseType: 'text' }).subscribe({
          next: (response) => observer.next(response as string),
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
      });
    });
  }
}

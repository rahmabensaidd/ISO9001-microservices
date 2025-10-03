import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Ajout pour transformer la réponse

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private apiUrl = 'http://localhost:8089/api/currency';

  constructor(private http: HttpClient) {}

  getExchangeRates(): Observable<Map<string, number>> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/rates`).pipe(
      map(data => {
        const ratesMap = new Map<string, number>();
        Object.entries(data).forEach(([currency, rate]) => {
          ratesMap.set(currency, rate);
        });
        return ratesMap;
      })
    );
  }

  getPreviousRates(): Observable<Map<string, number>> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/previous-rates`).pipe(
      map(data => {
        const ratesMap = new Map<string, number>();
        Object.entries(data).forEach(([currency, rate]) => {
          ratesMap.set(currency, rate);
        });
        return ratesMap;
      })
    );
  }

  getAvailableCurrencies(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/currencies`);
  }

  convertCurrency(request: { amount: number; fromCurrency: string; toCurrency: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/convert`, request);
  }

  hasRates(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/has-rates`);
  }
}

export interface ExchangeRate {
  currency: string;
  rate: number;
  previousRate: number;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = 'http://localhost:8089/api/stock';

  constructor(private http: HttpClient) {}

  getStockData(symbol: string = 'AAPL'): Observable<Map<string, Map<string, number>>> {
    return this.http.get<Map<string, Map<string, number>>>(`${this.apiUrl}/data?symbol=${symbol}`);
  }

  hasStockData(): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/has-data`);
  }
}

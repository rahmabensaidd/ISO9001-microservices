import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Kpi {
  idIndicateur: number;
  name: string;
  unite: string;
  cible: number;
}

export interface PredictionResponse {
  indicatorId: number;
  predictedValue: number;
  calculatedValue: number; // Add this property
  date: string;
  mae: number;
  rmse: number;
  metadataSummary: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionKpiService {
  private apiUrl = 'http://localhost:5000/api/predictions/upload';

  constructor(private http: HttpClient) {}

  uploadCsv(file: File): Observable<{ predictions: PredictionResponse[], kpis: Kpi[] }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ predictions: PredictionResponse[], kpis: Kpi[] }>(this.apiUrl, formData);
  }

  isSupportedFile(file: File): boolean {
    return file.name.endsWith('.csv') || file.name.endsWith('.pdf');
  }
}

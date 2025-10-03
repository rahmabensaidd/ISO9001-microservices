// src/app/services/shared-search.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SearchResult } from '@/app/services/search.service';
import {OcrDocument} from "@/app/services/ocr-service.service";

@Injectable({
  providedIn: 'root',
})
export class SharedSearchService {
  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);
  searchResults$: Observable<SearchResult[]> = this.searchResultsSubject.asObservable();
  private documentSearchResultsSubject = new BehaviorSubject<OcrDocument[]>([]);
  documentSearchResults$ = this.documentSearchResultsSubject.asObservable();
  updateSearchResults(results: SearchResult[]): void {
    this.searchResultsSubject.next(results);
  }

  clearSearchResults(): void {
    this.searchResultsSubject.next([]);
  }
  updateDocumentSearchResults(results: OcrDocument[]) {
    this.documentSearchResultsSubject.next(results);
  }

}

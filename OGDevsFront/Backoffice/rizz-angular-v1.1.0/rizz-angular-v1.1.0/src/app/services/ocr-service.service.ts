import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { from, Observable, of, throwError } from 'rxjs';
import { switchMap, catchError, tap, timeout } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { saveAs } from 'file-saver';

export interface OcrDocument {
  id: number | null;
  title: string;
  content: string;
  dateCreation: string;
  createdBy: { id: string } | null;
  summary?: string;
  category: string;
  type: string;
  version?: number | null;
}

export interface DocumentVersion {
  id: number | null;
  documentId: number;
  versionNumber: number;
  content: string;
  summary: string | null;
  dateModified: string;
}

export interface SummaryResponse {
  summary: string;
  fullText: string;
}

@Injectable({
  providedIn: 'root'
})
export class OcrService {
  private aiBackendUrl = 'http://localhost:8000/api/ocr';
  private readonly REQUEST_TIMEOUT = 120000;

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    let isLoggedIn: boolean;
    try {
      isLoggedIn = this.keycloakService.isLoggedIn();
    } catch (err) {
      console.error('Erreur lors de la vérification de isLoggedIn:', err);
      return throwError(() => new Error('Erreur lors de la vérification de l’authentification'));
    }

    if (!isLoggedIn) {
      console.error('Utilisateur non authentifié');
      return throwError(() => new Error('Utilisateur non authentifié. Veuillez vous connecter.'));
    }

    return of(null).pipe(
      switchMap(() => from(this.keycloakService.getToken())),
      switchMap((token: string) => {
        console.log('Token obtenu:', token.substring(0, 20) + '...');
        return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
      }),
      catchError(err => {
        console.error('Erreur lors de la récupération du token:', err);
        return throwError(() => new Error('Erreur d’authentification: ' + (err.message || err)));
      })
    );
  }

  uploadAndSummarize(file: File, userId: string | null, config: any, reportProgress: boolean = false): Observable<HttpEvent<SummaryResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    if (config) {
      if (config.summaryLength) {
        formData.append('summary_length', config.summaryLength.toString());
      }
      if (config.removeBlankPages || config.colorMode) {
        console.warn('Configuration fields removeBlankPages and colorMode are not supported by the backend');
      }
    }

    console.log('Préparation de l’upload - Fichier:', file.name, 'Taille:', file.size, 'UserId:', userId, 'Config:', config);

    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<SummaryResponse>(`${this.aiBackendUrl}/summarize`, formData, {
          headers,
          reportProgress,
          observe: 'events'
        })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(event => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          console.log('Progression:', Math.round(100 * event.loaded / event.total) + '%');
        } else if (event.type === HttpEventType.Response) {
          console.log('Résumé reçu:', (event as HttpResponse<SummaryResponse>).body?.summary.substring(0, 50) + '...');
        }
      }),
      catchError(err => {
        console.error('Erreur lors de l’upload vers FastAPI:', err);
        let errorMessage = err.error?.detail || err.message || 'Impossible de se connecter au serveur FastAPI';
        if (err.status === 404) {
          errorMessage = `Endpoint non trouvé: ${err.url}. Vérifiez que l'URL est correcte (/api/ocr/summarize).`;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  saveDocument(document: OcrDocument): Observable<OcrDocument> {
    // Transform createdBy from object to string
    const payload = {
      ...document,
      createdBy: document.createdBy ? document.createdBy.id : null
    };
    console.log('Envoi du document au backend:', payload);

    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<OcrDocument>(`${this.aiBackendUrl}/documents`, payload, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(response => console.log('Document sauvegardé:', response.title)),
      catchError(err => {
        console.error('Erreur lors de la sauvegarde du document:', err);
        let errorMessage = err.error?.detail || err.message || 'Erreur lors de la sauvegarde';
        if (err.status === 422) {
          errorMessage = `Validation error: ${JSON.stringify(err.error?.detail)}. Vérifiez les champs du document (title, content, dateCreation, category, type).`;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  generatePdf(summary: string, content: string, title: string, dateCreation: string, createdBy: string, config: any): Observable<void> {
    if (!summary || summary.trim() === '') {
      console.error('Résumé vide fourni pour la génération PDF');
      return throwError(() => new Error('Le résumé ne peut pas être vide'));
    }

    const formData = new FormData();
    formData.append('summary', summary);
    formData.append('content', content);
    formData.append('title', title);
    formData.append('dateCreation', dateCreation);
    formData.append('createdBy', createdBy);
    if (config) {
      formData.append('config', JSON.stringify(config));
    }

    console.log('Génération PDF - Titre:', title, 'Résumé:', summary, 'Config:', config);

    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post(`${this.aiBackendUrl}/generate-pdf`, formData, { headers, responseType: 'blob' })
      ),
      timeout(this.REQUEST_TIMEOUT),
      switchMap((pdfBlob: Blob) => {
        console.log('PDF généré, taille:', pdfBlob.size);
        saveAs(pdfBlob, `${title.replace(' ', '_')}.pdf`);
        return of(void 0);
      }),
      catchError(err => {
        console.error('Erreur lors de la génération PDF:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la génération du PDF';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllDocuments(): Observable<OcrDocument[]> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<OcrDocument[]>(`${this.aiBackendUrl}/documents`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(documents => console.log('Documents récupérés:', documents.length)),
      catchError(err => {
        console.error('Erreur lors de la récupération des documents:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la récupération des documents';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getArchivedDocuments(): Observable<OcrDocument[]> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<OcrDocument[]>(`${this.aiBackendUrl}/archived-documents`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(documents => console.log('Documents archivés récupérés:', documents.length)),
      catchError(err => {
        console.error('Erreur lors de la récupération des documents archivés:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la récupération des documents archivés';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getDocumentById(id: number): Observable<OcrDocument> {
    if (!id) {
      console.error('ID invalide pour la récupération du document');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    console.log('Récupération du document ID:', id);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<OcrDocument>(`${this.aiBackendUrl}/documents/${id}`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(document => console.log('Document récupéré:', document.title)),
      catchError(err => {
        console.error('Erreur lors de la récupération du document:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la récupération du document';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  searchDocuments(keyword: string): Observable<OcrDocument[]> {
    if (!keyword || keyword.trim() === '') {
      console.error('Mot-clé vide pour la recherche');
      return throwError(() => new Error('Le mot-clé ne peut pas être vide'));
    }
    console.log('Recherche avec mot-clé:', keyword);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<OcrDocument[]>(`${this.aiBackendUrl}/search?keyword=${encodeURIComponent(keyword)}`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(results => console.log('Résultats de recherche:', results.length)),
      catchError(err => {
        console.error('Erreur lors de la recherche:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la recherche';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  archiveDocument(id: number | null): Observable<OcrDocument> {
    if (!id) {
      console.error('ID invalide pour l’archivage');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    console.log('Archivage du document ID:', id);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<OcrDocument>(`${this.aiBackendUrl}/archive/${id}`, {}, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(document => console.log('Document archivé:', document.title)),
      catchError(err => {
        console.error('Erreur lors de l’archivage:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de l’archivage';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  unarchiveDocument(id: number | null): Observable<OcrDocument> {
    if (!id) {
      console.error('ID invalide pour le désarchivage');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    console.log('Désarchivage du document ID:', id);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<OcrDocument>(`${this.aiBackendUrl}/unarchive/${id}`, {}, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(document => console.log('Document désarchivé:', document.title)),
      catchError(err => {
        console.error('Erreur lors du désarchivage:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors du désarchivage';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  deleteDocument(id: number | null): Observable<{ message: string }> {
    if (!id) {
      console.error('ID invalide pour la suppression');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    console.log('Suppression du document ID:', id);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.delete<{ message: string }>(`${this.aiBackendUrl}/documents/${id}`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(response => console.log('Document supprimé:', response.message)),
      catchError(err => {
        console.error('Erreur lors de la suppression:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la suppression';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getDocumentVersions(id: number | null): Observable<DocumentVersion[]> {
    if (!id) {
      console.error('ID invalide pour la récupération des versions');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    console.log('Récupération des versions du document ID:', id);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<DocumentVersion[]>(`${this.aiBackendUrl}/documents/${id}/versions`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(versions => console.log('Versions récupérées:', versions.length)),
      catchError(err => {
        console.error('Erreur lors de la récupération des versions:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la récupération des versions';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getDocumentVersion(id: number | null, versionNumber: number): Observable<DocumentVersion> {
    if (!id) {
      console.error('ID invalide pour la récupération de la version');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    if (!versionNumber || versionNumber < 1) {
      console.error('Numéro de version invalide');
      return throwError(() => new Error('Le numéro de version doit être supérieur à 0'));
    }
    console.log(`Récupération de la version ${versionNumber} du document ID:`, id);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<DocumentVersion>(`${this.aiBackendUrl}/documents/${id}/version/${versionNumber}`, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(version => console.log('Version récupérée:', version.versionNumber)),
      catchError(err => {
        console.error('Erreur lors de la récupération de la version:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la récupération de la version';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  updateDocument(id: number | null, document: OcrDocument): Observable<OcrDocument> {
    if (!id) {
      console.error('ID invalide pour la mise à jour');
      return throwError(() => new Error('L’ID du document ne peut pas être null ou invalide'));
    }
    // Transform createdBy for update
    const payload = {
      ...document,
      createdBy: document.createdBy ? document.createdBy.id : null
    };
    console.log('Mise à jour du document ID:', id, 'Payload:', payload);
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.put<OcrDocument>(`${this.aiBackendUrl}/documents/${id}`, payload, { headers })
      ),
      timeout(this.REQUEST_TIMEOUT),
      tap(updatedDoc => console.log('Document mis à jour:', updatedDoc.title)),
      catchError(err => {
        console.error('Erreur lors de la mise à jour du document:', err);
        const errorMessage = err.error?.detail || err.message || 'Erreur lors de la mise à jour';
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}

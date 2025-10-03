import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { Document, TypeDocument } from '@/app/core/models/document.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = 'http://localhost:8089/documents';
  private faceRecognitionApiUrl = 'http://localhost:8000/face-recognition/verify';

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return from(Promise.resolve(this.keycloakService.isLoggedIn())).pipe(
      switchMap((isLoggedIn: boolean) => {
        if (!isLoggedIn) {
          return throwError(() => new Error('Utilisateur non authentifié'));
        }
        return from(this.keycloakService.getToken()).pipe(
          switchMap((token: string) => {
            if (!token) {
              return throwError(() => new Error('Aucun token disponible'));
            }
            return of(new HttpHeaders().set('Authorization', `Bearer ${token}`));
          })
        );
      }),
      catchError((err: unknown) => {
        console.error('Erreur lors de la récupération du token', err);
        return throwError(() => err instanceof Error ? err : new Error('Erreur d’authentification'));
      })
    );
  }

  createDocument(document: Document): Observable<Document> {
    if (!document.title || document.title.trim() === '') {
      return throwError(() => new Error('Le titre du document est requis'));
    }
    if (!document.type || !Object.values(TypeDocument).includes(document.type)) {
      return throwError(() => new Error('Le type de document est requis et doit être valide'));
    }

    let payload: Document = {
      title: document.title,
      content: document.content || '',
      type: document.type,
      dateCreation: document.dateCreation
        ? document.dateCreation.split('T')[0]
        : new Date().toISOString().split('T')[0],
    };

    if (document.type === TypeDocument.FICHE_PAIE) {
      payload = {
        ...payload,
        employe: document.employe || 'Unknown',
        periode: document.periode || new Date().toISOString().split('T')[0].substring(0, 7),
        salaireBrut: document.salaireBrut ? Number(document.salaireBrut) : 0,
        salaireNet: document.salaireNet ? Number(document.salaireNet) : 0,
        cotisationsSociales: document.cotisationsSociales ? Number(document.cotisationsSociales) : 0,
      };
    } else if (document.type === TypeDocument.CONTRAT) {
      payload = {
        ...payload,
        employe: document.employe || 'Unknown',
        typeContrat: document.typeContrat || 'CDI',
        dateDebut: document.dateDebut || new Date().toISOString().split('T')[0],
        dateFin: document.dateFin || undefined,
        salaire: document.salaire ? Number(document.salaire) : 0,
      };
    }

    console.log('Payload envoyé au backend:', JSON.stringify(payload));

    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.http.post<Document>(`${this.apiUrl}/createDocument`, payload, { headers });
      }),
      catchError((err: unknown) => {
        console.error('Erreur lors de la création du document:', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de la création du document'));
      })
    );
  }

  getDocumentVersions(documentId: number): Observable<any[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.http.get<any[]>(`${this.apiUrl}/${documentId}/versions`, { headers });
      }),
      catchError((err: unknown) => {
        console.error('Erreur lors de la récupération des versions:', err);
        return throwError(() => new Error('Erreur lors de la récupération des versions'));
      })
    );
  }

  getAllDocuments(): Observable<Document[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Document[]>(`${this.apiUrl}/getallDocuments`, { headers })),
      catchError((err: unknown) => {
        console.error('Erreur lors de la récupération des documents', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de la récupération des documents'));
      })
    );
  }

  getDocumentById(id: number): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Document>(`${this.apiUrl}/getDocument/${id}`, { headers })),
      catchError((err: unknown) => {
        console.error('Erreur lors de la récupération du document', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de la récupération du document'));
      })
    );
  }

  updateDocument(id: number, document: Document): Observable<Document> {
    // Create a sanitized payload
    let payload: Document = {
      id: document.id,
      title: document.title,
      content: document.content || '',
      type: document.type,
      dateCreation: document.dateCreation || new Date().toISOString().split('T')[0],
      createdBy: document.createdBy ? { id: document.createdBy.id } : undefined,
      signature: document.signature || undefined,
    };

    // Handle type-specific fields
    if (document.type === TypeDocument.FICHE_PAIE) {
      payload = {
        ...payload,
        employe: document.employe || 'Unknown',
        poste: document.poste || undefined,
        periode: document.periode || new Date().toISOString().split('T')[0].substring(0, 7),
        salaireBrut: document.salaireBrut ? Number(document.salaireBrut) : 0,
        salaireNet: document.salaireNet ? Number(document.salaireNet) : 0,
        cotisationsSociales: document.cotisationsSociales ? Number(document.cotisationsSociales) : 0,
      };
    } else if (document.type === TypeDocument.CONTRAT) {
      payload = {
        ...payload,
        employe: document.employe || 'Unknown',
        typeContrat: document.typeContrat || 'CDI',
        dateDebut: document.dateDebut || new Date().toISOString().split('T')[0],
        dateFin: document.dateFin || undefined,
        salaire: document.salaire ? Number(document.salaire) : 0,
      };
    } else if (document.type === TypeDocument.FICHE_POSTE) {
      payload = {
        ...payload,
        poste: document.poste || undefined,
        exigenceDePoste: document.exigenceDePoste || undefined,
        taches: document.taches || undefined,
      };
    } else if (document.type === TypeDocument.PROCESSUS_REALISATION) {
      payload = {
        ...payload,
        designation: document.designation || undefined,
        axe: document.axe || undefined,
        pilote: document.pilote || undefined,
      };
    }

    console.log('Payload envoyé au backend pour mise à jour:', JSON.stringify(payload, null, 2));

    return this.getHeaders().pipe(
      switchMap((headers) => this.http.put<Document>(`${this.apiUrl}/update/${id}`, payload, { headers })),
      catchError((err) => {
        console.error('Erreur lors de la mise à jour du document', err);
        return throwError(() => new Error(err.error?.message || 'Erreur lors de la mise à jour du document'));
      })
    );
  }
  deleteDocument(id: number): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.delete<void>(`${this.apiUrl}/deleteDocument/${id}`, { headers })),
      catchError((err: unknown) => {
        console.error('Erreur lors de la suppression du document', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de la suppression du document'));
      })
    );
  }

  verifyFace(image: string, userId: string): Observable<{ verified: boolean; distance?: number; threshold?: number }> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const payload = {
          images: [image],
          userId
        };
        const updatedHeaders = headers.set('Content-Type', 'application/json');
        return this.http.post<{ verified: boolean; distance?: number; threshold?: number }>(
          this.faceRecognitionApiUrl,
          payload,
          { headers: updatedHeaders }
        ).pipe(
          catchError((err: unknown) => {
            console.error('verifyFace: Error during face verification', err);
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification faciale';
            return throwError(() => new Error(errorMessage));
          })
        );
      })
    );
  }

  searchDocuments(query: string): Observable<Document[]> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<Document[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`, { headers })
      ),
      catchError((err: unknown) => {
        console.error('Erreur lors de la recherche des documents', err);
        return of([]);
      })
    );
  }

  getArchivedDocuments(): Observable<Document[]> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.get<Document[]>(`${this.apiUrl}/archived`, { headers })),
      catchError((err: unknown) => {
        console.error('Erreur lors de la récupération des documents archivés:', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de la récupération des documents archivés'));
      })
    );
  }

  archiveDocument(id: number): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Document>(`${this.apiUrl}/archive/${id}`, {}, { headers })),
      catchError((err: unknown) => {
        console.error('Erreur lors de l\'archivage du document:', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de l\'archivage du document'));
      })
    );
  }

  unarchiveDocument(id: number): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => this.http.post<Document>(`${this.apiUrl}/unarchive/${id}`, {}, { headers })),
      catchError((err: unknown) => {
        console.error('Erreur lors du désarchivage du document:', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors du désarchivage du document'));
      })
    );
  }

  uploadFile(file: File, userId?: string, config?: Map<string, any>): Observable<Document> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        const formData = new FormData();
        formData.append('file', file);
        if (userId) {
          formData.append('userId', userId);
        }
        if (config) {
          formData.append('config', JSON.stringify(config));
        }
        return this.http.post<Document>(`${this.apiUrl}/upload`, formData, { headers });
      }),
      catchError((err: unknown) => {
        console.error('Erreur lors de l\'upload du fichier:', err);
        return throwError(() => new Error(err instanceof Error ? err.message : 'Erreur lors de l\'upload du fichier'));
      })
    );
  }
}

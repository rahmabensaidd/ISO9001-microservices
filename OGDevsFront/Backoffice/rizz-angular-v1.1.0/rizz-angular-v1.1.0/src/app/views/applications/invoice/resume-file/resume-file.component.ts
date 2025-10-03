import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SweetAlertService } from '@/app/services/sweet-alert.service';
import Swal from 'sweetalert2';
import { HttpEventType, HttpEvent } from '@angular/common/http';
import { Observable, Subject, of, Subscription } from 'rxjs';
import { catchError, takeUntil, switchMap, tap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { SharedSearchService } from '@/app/services/shared-search.service';
import { Router } from '@angular/router';
import { OcrDocument, OcrService, SummaryResponse, DocumentVersion } from '@/app/services/ocr-service.service';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

interface SummaryConfig {
  pageCount: number;
  paperFormat: string;
  colorMode: string;
  optimizeSize: boolean;
  enableOcrSearch: boolean;
  removeBlankPages: boolean;
  summaryLength: number;
}

@Component({
  selector: 'app-resume-file',
  templateUrl: './resume-file.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbDropdownModule],
  providers: [DatePipe],
  styleUrls: ['./resume-file.component.css']
})
export class ResumeFileComponent implements OnInit, OnDestroy {
  searchKeyword: string = '';
  documents$: Observable<OcrDocument[]> | null = null;
  archivedDocuments$: Observable<OcrDocument[]> | null = null;
  selectedFile: File | null = null;
  summary: string = '';
  fullText: string = '';
  showPopup: boolean = false;
  showConfigPopup: boolean = false;
  userId: string | null = null;
  uploadProgress: number = 0;
  isDragging: boolean = false;
  isProcessing: boolean = false;
  currentTab: 'Files' | 'Archive' = 'Files';
  selectedDocument: OcrDocument | null = null;
  currentUser: string = 'Utilisateur';
  currentDate: Date = new Date();
  readonly MAX_FILE_SIZE = 25 * 1024 * 1024;
  errorMessage: string | null = null;
  private searchSubscription: Subscription | null = null;
  documentVersions: DocumentVersion[] = [];

  summaryConfig: SummaryConfig = {
    pageCount: 1,
    paperFormat: 'A4',
    colorMode: 'color',
    optimizeSize: false,
    enableOcrSearch: true,
    removeBlankPages: true,
    summaryLength: 200
  };

  configForm: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private ocrService: OcrService,
    private sweetAlert: SweetAlertService,
    private keycloakService: KeycloakService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private sharedSearchService: SharedSearchService,
    private router: Router
  ) {
    this.configForm = this.fb.group({
      summaryLength: [200, [Validators.required, Validators.min(50), Validators.max(1000)]],
      removeBlankPages: [true],
      colorMode: ['color', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        this.sweetAlert.showError('Veuillez vous connecter pour continuer.');
        await this.keycloakService.login();
        return;
      }

      const userProfile = await this.keycloakService.loadUserProfile();
      this.userId = userProfile.id || null;
      this.currentUser = userProfile.username || 'Utilisateur';
      this.loadDocuments();
      this.loadArchivedDocuments();

      this.searchSubscription = this.sharedSearchService.documentSearchResults$.subscribe(results => {
        console.log('Received document search results in ResumeFileComponent:', results);
        if (results.length > 0) {
          this.documents$ = of(results);
        } else {
          this.loadDocuments();
        }
      });

      let documentId: number | undefined;
      const navigation = this.router.getCurrentNavigation();
      if (navigation?.extras?.state) {
        documentId = navigation.extras.state['documentId'];
      } else {
        documentId = window.history.state?.documentId;
      }
      console.log('Document ID from navigation:', documentId);
      if (documentId) {
        this.loadDocumentById(documentId);
      } else {
        console.warn('No documentId found in navigation state');
      }
    } catch (err: any) {
      console.error('Erreur lors de l’initialisation avec Keycloak:', err);
      this.sweetAlert.showError('Erreur lors de l’initialisation: ' + (err.message || err.toString()));
      await this.keycloakService.login();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  loadDocuments(): void {
    this.documents$ = (this.currentTab === 'Files'
        ? this.ocrService.getAllDocuments()
        : this.ocrService.getArchivedDocuments()
    ).pipe(
      catchError((err) => {
        console.error(`Erreur chargement ${this.currentTab}:`, err);
        this.sweetAlert.showError(`Impossible de charger les ${this.currentTab.toLowerCase()}: ${err.message}`);
        return of([]);
      }),
      tap((documents: OcrDocument[]) => {
        console.log(`${this.currentTab} chargés:`, documents.length);
      }),
      takeUntil(this.destroy$)
    );
  }

  loadArchivedDocuments(): void {
    this.archivedDocuments$ = this.ocrService.getArchivedDocuments().pipe(
      catchError((err) => {
        console.error('Erreur chargement documents archivés:', err);
        this.sweetAlert.showError('Impossible de charger les documents archivés: ' + err.message);
        return of([]);
      }),
      tap((documents: OcrDocument[]) => {
        console.log('Documents archivés chargés:', documents.length);
      }),
      takeUntil(this.destroy$)
    );
  }

  loadDocumentById(id: number): void {
    console.log('Fetching document with ID:', id);
    this.ocrService.getDocumentById(id).pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error('Failed to load document:', err);
        this.errorMessage = 'Document not found. Please try another document.';
        return of(null);
      })
    ).subscribe((doc: OcrDocument | null) => {
      if (doc) {
        console.log('Document loaded successfully:', doc);
        this.selectedDocument = doc;
        this.viewSummary(doc);
      }
    });
  }

  switchTab(tab: 'Files' | 'Archive'): void {
    this.currentTab = tab;
    this.searchKeyword = '';
    this.loadDocuments();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Fichier sélectionné:', this.selectedFile?.name);
      if (this.selectedFile.size > this.MAX_FILE_SIZE) {
        this.sweetAlert.showError('Le fichier dépasse la limite de 25 Mo.');
        this.selectedFile = null;
        return;
      }
      this.showConfigPopup = true;
    } else {
      console.log('Aucun fichier sélectionné');
      this.selectedFile = null;
    }
  }

  onDragOver(event: Event): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: Event): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      console.log('Fichier déposé:', this.selectedFile?.name);
      if (this.selectedFile.size > this.MAX_FILE_SIZE) {
        this.sweetAlert.showError('Le fichier dépasse la limite de 25 Mo.');
        this.selectedFile = null;
        return;
      }
      this.showConfigPopup = true;
    } else {
      console.log('Aucun fichier déposé');
      this.selectedFile = null;
    }
  }

  startProcessing(isArchive: boolean = false): void {
    if (!this.selectedFile) {
      this.sweetAlert.showError('Veuillez sélectionner un fichier.');
      return;
    }

    if (this.configForm.invalid) {
      this.sweetAlert.showError('La longueur du résumé doit être entre 50 et 1000 caractères.');
      return;
    }

    const fileName = this.selectedFile.name;
    console.log('Début du traitement - Fichier:', fileName);

    this.summaryConfig.summaryLength = this.configForm.get('summaryLength')?.value;
    this.summaryConfig.removeBlankPages = this.configForm.get('removeBlankPages')?.value;
    this.summaryConfig.colorMode = this.configForm.get('colorMode')?.value;

    Swal.fire({
      title: 'Confirmer le traitement',
      text: 'Voulez-vous traiter ce document ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showConfigPopup = false;
        this.isProcessing = true;
        this.uploadProgress = 0;

        this.ocrService.uploadAndSummarize(this.selectedFile!, this.userId, this.summaryConfig, true).pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.handleError(err, 'Erreur lors du traitement');
            return of(null);
          }),
          switchMap((event: HttpEvent<SummaryResponse> | null) => {
            if (!event) return of(null);
            if (event.type === HttpEventType.UploadProgress && event.total) {
              this.uploadProgress = Math.round(100 * event.loaded / event.total);
            } else if (event.type === HttpEventType.Response) {
              this.uploadProgress = 100;
              this.summary = event.body!.summary;
              this.fullText = event.body!.fullText || '';
              const document: OcrDocument = {
                id: null,
                title: fileName,
                content: this.fullText,
                summary: this.summary,
                dateCreation: new Date().toISOString(),
                createdBy: this.userId ? { id: this.userId } : null,
                category: isArchive ? 'Archive' : 'Files',
                type: 'AUTRE',
                version: 1
              };
              return this.ocrService.saveDocument(document).pipe(
                catchError((err) => {
                  this.handleError(err, 'Erreur lors de la sauvegarde');
                  return of(null);
                })
              );
            }
            return of(null);
          })
        ).subscribe((savedDoc: OcrDocument | null) => {
          if (savedDoc) {
            this.selectedDocument = savedDoc;
            this.showPopup = true;
            this.sweetAlert.showSuccess('Document traité avec succès !');
            this.loadDocuments();
            this.loadArchivedDocuments();
          }
          this.isProcessing = false;
          this.uploadProgress = 0;
          console.log('Réinitialisation de selectedFile');
          this.selectedFile = null;
        });
      }
    });
  }

  viewSummary(doc: OcrDocument): void {
    this.selectedDocument = doc;
    this.summary = doc.summary || '';
    this.fullText = doc.content || '';
    this.showPopup = true;
  }

  downloadFullDocument(): void {
    if (!this.selectedDocument) {
      this.sweetAlert.showError('Aucun document sélectionné.');
      return;
    }

    this.isProcessing = true;
    const config = {
      paperFormat: this.summaryConfig.paperFormat,
      optimizeSize: this.summaryConfig.optimizeSize
    };

    const formattedDate = this.datePipe.transform(this.selectedDocument.dateCreation, 'yyyy-MM-dd') || this.selectedDocument.dateCreation;

    this.ocrService.generatePdf(
      this.selectedDocument.summary || '',
      this.selectedDocument.content || '',
      this.selectedDocument.title,
      formattedDate,
      this.currentUser,
      config
    ).pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        this.sweetAlert.showError('Erreur lors de la génération du PDF: ' + err.message);
        this.isProcessing = false;
        return of(null);
      })
    ).subscribe(() => {
      this.isProcessing = false;
      this.sweetAlert.showSuccess('PDF téléchargé avec succès !');
    });
  }

  searchDocuments(): void {
    if (!this.searchKeyword) {
      this.loadDocuments();
      return;
    }

    this.documents$ = this.ocrService.searchDocuments(this.searchKeyword).pipe(
      catchError((err) => {
        console.error('Erreur recherche:', err);
        this.sweetAlert.showError('Erreur lors de la recherche: ' + err.message);
        return of([]);
      }),
      tap((results: OcrDocument[]) => console.log('Résultats recherche:', results.length)),
      takeUntil(this.destroy$)
    );
  }

  closePopup(): void {
    this.showPopup = false;
    this.summary = '';
    this.fullText = '';
    this.selectedDocument = null;
    this.documentVersions = [];
  }

  closeConfigPopup(): void {
    this.showConfigPopup = false;
    this.configForm.reset({ summaryLength: 200, removeBlankPages: true, colorMode: 'color' });
    this.selectedFile = null;
  }

  archiveDocument(id: number | null): void {
    if (!id) {
      this.sweetAlert.showError('ID de document invalide.');
      return;
    }

    Swal.fire({
      title: 'Confirmer l\'archivage',
      text: 'Voulez-vous archiver ce document ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ocrService.archiveDocument(id).pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.sweetAlert.showError('Erreur lors de l\'archivage: ' + err.message);
            return of(null);
          })
        ).subscribe((document) => {
          if (document) {
            this.sweetAlert.showSuccess('Document archivé avec succès !');
            this.loadDocuments();
            this.loadArchivedDocuments();
          }
        });
      }
    });
  }

  unarchiveDocument(id: number | null): void {
    if (!id) {
      this.sweetAlert.showError('ID de document invalide.');
      return;
    }

    Swal.fire({
      title: 'Confirmer le désarchivage',
      text: 'Voulez-vous désarchiver ce document ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ocrService.unarchiveDocument(id).pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.sweetAlert.showError('Erreur lors du désarchivage: ' + err.message);
            return of(null);
          })
        ).subscribe((document) => {
          if (document) {
            this.sweetAlert.showSuccess('Document désarchivé avec succès !');
            this.loadDocuments();
            this.loadArchivedDocuments();
          }
        });
      }
    });
  }

  deleteDocument(id: number | null): void {
    if (!id) {
      this.sweetAlert.showError('ID de document invalide.');
      return;
    }

    Swal.fire({
      title: 'Confirmer la suppression',
      text: 'Voulez-vous supprimer ce document ? Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.ocrService.deleteDocument(id).pipe(
          takeUntil(this.destroy$),
          catchError((err) => {
            this.sweetAlert.showError('Erreur lors de la suppression: ' + err.message);
            return of(null);
          })
        ).subscribe((response) => {
          if (response) {
            this.sweetAlert.showSuccess('Document supprimé avec succès !');
            this.loadDocuments();
            this.loadArchivedDocuments();
          }
        });
      }
    });
  }

  selectDocument(doc: OcrDocument): void {
    this.selectedDocument = doc;
    this.ocrService.getDocumentVersions(doc.id!).pipe(
      takeUntil(this.destroy$),
      catchError((err) => {
        this.sweetAlert.showError('Erreur lors de la récupération des versions: ' + err.message);
        return of([]);
      })
    ).subscribe((versions) => {
      this.documentVersions = versions;
      Swal.fire({
        title: `Versions du document: ${doc.title}`,
        html: `
          <ul>
            ${versions.map(v => `<li>Version ${v.versionNumber} - Modifié le ${new Date(v.dateModified).toLocaleString()}</li>`).join('')}
          </ul>
        `,
        showConfirmButton: true,
        confirmButtonText: 'Fermer'
      });
    });
  }

  private handleError(err: any, defaultMessage: string): void {
    this.isProcessing = false;
    this.uploadProgress = 0;
    this.sweetAlert.showError(`${defaultMessage}: ${err.message}`);
  }
}

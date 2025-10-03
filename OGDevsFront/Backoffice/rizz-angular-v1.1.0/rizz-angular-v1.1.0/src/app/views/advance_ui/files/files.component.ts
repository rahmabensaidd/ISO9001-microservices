import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { DocumentService } from '@/app/services/document.service';
import { Document } from '@/app/core/models/document.model';
import Swal from 'sweetalert2';
import { NgbDropdownModule, NgbNavModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';

interface DocumentWithCategory extends Document {
  category?: string;
}

@Component({
  selector: 'app-files',
  imports: [
    NgbProgressbarModule,
    CommonModule,
    NgbNavModule,
    NgbDropdownModule
  ],
  templateUrl: './files.component.html',
  styles: ``,
  standalone: true
})
export class FilesComponent implements OnInit {
  archivedDocuments: DocumentWithCategory[] = [];
  documents: DocumentWithCategory[] = [];
  selectedDocument: DocumentWithCategory | null = null;
  versions: { numeroVersion: number; statut?: string; dateCreation: string; modifiePar?: string; contenu?: string }[] = [];
  docVersionsCount: { [key: number]: number } = {};
  allVersions: { [key: number]: { dateCreation: string; modifiePar?: string }[] } = {};
  currentUser: string = 'User';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
    private documentService: DocumentService,
    private keycloakService: KeycloakService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const profile = await this.keycloakService.getKeycloakInstance().loadUserProfile();
      this.currentUser = profile.username || 'User';
      console.log('Current user:', this.currentUser);
    } catch (err: unknown) {
      console.error('Error retrieving user profile:', err);
      this.currentUser = 'User';
    }

    this.loadDocuments();
    this.loadArchivedDocuments();
  }

  loadDocuments(): void {
    this.documentService.getAllDocuments().subscribe({
      next: (docs: Document[]) => {
        this.documents = docs.map(doc => ({
          ...doc,
          category: (doc as any).category || 'Files'
        })) as DocumentWithCategory[];
        console.log('All documents:', this.documents);
        this.documents.forEach(doc => {
          if (doc.id) {
            this.documentService.getDocumentVersions(doc.id).subscribe({
              next: (versions) => {
                this.docVersionsCount[doc.id!] = versions.length;
                this.allVersions[doc.id!] = versions;
              },
              error: (err: Error) => {
                console.error(`Error retrieving versions for document ${doc.id}:`, err);
              }
            });
          }
        });
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Error retrieving documents',
          confirmButtonText: 'OK'
        });
        console.error('Error retrieving documents:', err);
      }
    });
  }

  loadArchivedDocuments(): void {
    this.documentService.getArchivedDocuments().subscribe({
      next: (archivedDocs: Document[]) => {
        this.archivedDocuments = archivedDocs.map(doc => ({
          ...doc,
          category: (doc as any).category || 'Archive'
        })) as DocumentWithCategory[];
        console.log('Archived documents:', this.archivedDocuments);
        this.archivedDocuments.forEach(doc => {
          if (doc.id) {
            this.documentService.getDocumentVersions(doc.id).subscribe({
              next: (versions) => {
                this.docVersionsCount[doc.id!] = versions.length;
              },
              error: (err: Error) => {
                console.error(`Error retrieving versions for archived document ${doc.id}:`, err);
              }
            });
          }
        });
        if (archivedDocs.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Information',
            text: 'No archived documents found.',
            confirmButtonText: 'OK'
          });
        }
      },
      error: (err: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Error retrieving archived documents',
          confirmButtonText: 'OK'
        });
        console.error('Error retrieving archived documents:', err);
      }
    });
  }

  archiveDocument(id: number): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to archive this document?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, archive',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.archiveDocument(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Document archived successfully!',
              confirmButtonText: 'OK'
            });
            this.loadDocuments();
            this.loadArchivedDocuments();
            if (this.selectedDocument && this.selectedDocument.id === id) {
              this.selectedDocument = null;
              this.versions = [];
            }
          },
          error: (err: Error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.message || 'Error archiving document',
              confirmButtonText: 'OK'
            });
            console.error('Error archiving document:', err);
          }
        });
      }
    });
  }

  unarchiveDocument(id: number): void {
    this.documentService.unarchiveDocument(id).subscribe({
      next: (response: any) => {
        if (response.id) { // Check if response is a Document
          const index = this.documents.findIndex(doc => doc.id === response.id);
          if (index !== -1) {
            this.documents[index] = response;
          }
          Swal.fire('Success', 'Document unarchived successfully!', 'success');
        } else {
          Swal.fire('Error', response.error || 'Unexpected error', 'error');
        }
      },
      error: (error) => {
        console.error('Full error:', error);
        const errorMessage = error.error?.error || 'Error unarchiving document';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  deleteDocument(id: number): void {
    Swal.fire({
      title: 'Confirmation',
      text: 'Are you sure you want to delete this document? This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.documentService.deleteDocument(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Document deleted successfully!',
              confirmButtonText: 'OK'
            });
            this.loadDocuments();
            this.loadArchivedDocuments();
            if (this.selectedDocument && this.selectedDocument.id === id) {
              this.selectedDocument = null;
              this.versions = [];
            }
          },
          error: (err: Error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.message || 'Error deleting document',
              confirmButtonText: 'OK'
            });
            console.error('Error deleting document:', err);
          }
        });
      }
    });
  }

  selectDocument(doc: DocumentWithCategory): void {
    this.selectedDocument = doc;
    this.loadDocumentVersions();
  }

  loadDocumentVersions(): void {
    if (this.selectedDocument && this.selectedDocument.id) {
      this.documentService.getDocumentVersions(this.selectedDocument.id).subscribe({
        next: (versions) => {
          this.versions = versions;
          console.log('Document versions:', this.versions);
          if (versions.length === 0) {
            Swal.fire({
              icon: 'info',
              title: 'Information',
              text: 'No versions found for this document.',
              confirmButtonText: 'OK'
            });
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Versions Retrieved',
              text: `Number of versions: ${versions.length}`,
              confirmButtonText: 'OK'
            });
          }
        },
        error: (err: Error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error retrieving versions',
            confirmButtonText: 'OK'
          });
          console.error('Error retrieving versions:', err);
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.keycloakService.getKeycloakInstance().loadUserProfile().then(profile => {
        const userId = profile.id;
        console.log('Uploading file with userId:', userId);
        const config = new Map<string, any>();
        config.set('removeBlankPages', true);
        this.documentService.uploadFile(file, userId, config).subscribe({
          next: (createdDoc) => {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Document uploaded and created successfully!',
              confirmButtonText: 'OK'
            });
            this.loadDocuments();
            this.loadArchivedDocuments();
            this.fileInput.nativeElement.value = '';
          },
          error: (err: Error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: err.message || 'Error uploading file',
              confirmButtonText: 'OK'
            });
            console.error('Error uploading file:', err);
          }
        });
      }).catch((err: Error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error retrieving user profile',
          confirmButtonText: 'OK'
        });
        console.error('Error retrieving user profile:', err);
      });
    }
  }

  calculateStorage(content: string): string {
    const sizeInKB = content.length / 1024;
    return sizeInKB.toFixed(2);
  }

  latestVersion(docId: number): { dateCreation: string; modifiePar?: string } | null {
    const versions = this.allVersions[docId];
    if (versions && versions.length > 0) {
      return versions.reduce((latest, current) => {
        return new Date(current.dateCreation) > new Date(latest.dateCreation) ? current : latest;
      });
    }
    return null;
  }

  formatDate(date: string | undefined): string {
    return date ? new Date(date).toISOString().split('T')[0] : '-';
  }

  getModifiedBy(modifiePar: string | undefined): string {
    if (modifiePar && modifiePar !== 'System') {
      return modifiePar;
    }
    return this.currentUser;
  }
}

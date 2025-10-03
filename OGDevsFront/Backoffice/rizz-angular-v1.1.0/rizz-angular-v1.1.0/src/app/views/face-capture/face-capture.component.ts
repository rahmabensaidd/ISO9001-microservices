import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, EventEmitter, Output, Input, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { DocumentService } from '@/app/services/document.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-face-capture',
  templateUrl: './face-capture.component.html',
  styleUrls: ['./face-capture.component.css'],
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [style({ opacity: 0 }), animate('300ms', style({ opacity: 1 }))]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))])
    ])
  ]
})
export class FaceCaptureComponent implements AfterViewInit, OnDestroy {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas', { static: false }) overlayCanvas!: ElementRef<HTMLCanvasElement>;
  @Output() faceVerified = new EventEmitter<boolean>();
  @Input() userId: string = '';

  private stream: MediaStream | null = null;
  isCapturing: boolean = true;
  errorMessage: string = '';
  isProcessing: boolean = false;
  capturedImage: string | null = null;
  private isDestroyed: boolean = false;
  videoWidth: number = 640;
  videoHeight: number = 480;

  constructor(
    private documentService: DocumentService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: Initializing camera');
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.zone.run(() => {
          this.startCameraWithRetry();
        });
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.stopCamera();
  }

  private startCameraWithRetry(retryCount: number = 0, maxRetries: number = 3): void {
    if (this.isDestroyed) return;

    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement || !this.overlayCanvas?.nativeElement) {
      if (retryCount >= maxRetries) {
        this.errorMessage = 'Erreur : Impossible de trouver l’élément vidéo ou canvas.';
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          html: `${this.errorMessage}<br>Veuillez recharger la page.`,
          confirmButtonText: 'Recharger'
        }).then((result) => {
          if (result.isConfirmed) window.location.reload();
        });
        this.isCapturing = false;
        this.faceVerified.emit(false);
        this.cdr.detectChanges();
        return;
      }
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.cdr.detectChanges();
        this.startCameraWithRetry(retryCount + 1, maxRetries);
      }, 1000);
      return;
    }

    this.startCamera();
  }

  async startCamera(): Promise<void> {
    this.errorMessage = '';
    this.stopCamera();

    try {
      // Demander une résolution fixe pour un meilleur contrôle
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user" // Utiliser la caméra frontale
        }
      });
      this.stream = stream;
      this.videoElement.nativeElement.srcObject = stream;

      this.videoElement.nativeElement.onloadedmetadata = () => {
        this.videoWidth = this.videoElement.nativeElement.videoWidth;
        this.videoHeight = this.videoElement.nativeElement.videoHeight;
        this.overlayCanvas.nativeElement.width = this.videoWidth;
        this.overlayCanvas.nativeElement.height = this.videoHeight;
        this.drawFaceGuide();
        this.videoElement.nativeElement.play().then(() => {
          this.isCapturing = true;
          this.cdr.detectChanges();
        }).catch((err: Error) => {
          this.errorMessage = `Erreur lors de la lecture du flux vidéo : ${err.message}`;
          Swal.fire({
            icon: 'error',
            title: 'Erreur de lecture',
            html: `${this.errorMessage}<br><button class="btn btn-primary" onclick="window.location.reload()">Réessayer</button>`,
            showConfirmButton: false
          });
          this.isCapturing = false;
          this.stopCamera();
          this.faceVerified.emit(false);
          this.cdr.detectChanges();
        });
      };
    } catch (error: any) {
      this.errorMessage = 'Impossible d’accéder à la webcam.';
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        html: this.errorMessage,
        confirmButtonText: 'Réessayer',
        showCancelButton: true,
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) this.retryCamera();
        else {
          this.isCapturing = false;
          this.faceVerified.emit(false);
          this.stopCamera();
        }
      });
      this.cdr.detectChanges();
    }
  }

  private drawFaceGuide(): void {
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    // Dessiner un cercle vert comme guide
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Ajouter des lignes radiales pour un effet "scanner"
    const numLines = 20;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * 2 * Math.PI;
      const innerX = centerX + (radius - 10) * Math.cos(angle);
      const innerY = centerY + (radius - 10) * Math.sin(angle);
      const outerX = centerX + (radius + 10) * Math.cos(angle);
      const outerY = centerY + (radius + 10) * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(innerX, innerY);
      ctx.lineTo(outerX, outerY);
      ctx.strokeStyle = 'green';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  captureImage(): void {
    if (!this.isCapturing || !this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) {
      this.errorMessage = 'La webcam n’est pas prête.';
      Swal.fire('Erreur', this.errorMessage, 'error');
      this.isCapturing = false;
      this.cdr.detectChanges();
      return;
    }

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      this.errorMessage = 'Erreur lors de la préparation du canvas.';
      Swal.fire('Erreur', this.errorMessage, 'error');
      this.isCapturing = false;
      this.cdr.detectChanges();
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    if (imageData.length < 1000) {
      this.errorMessage = 'L’image capturée est vide ou corrompue.';
      Swal.fire('Erreur', this.errorMessage, 'error');
      this.isCapturing = false;
      this.cdr.detectChanges();
      return;
    }

    this.capturedImage = imageData;
    this.isCapturing = false;
    this.cdr.detectChanges();
  }

  retryCapture(): void {
    this.capturedImage = null;
    this.isCapturing = true;
    this.errorMessage = '';
    this.cdr.detectChanges();
    this.startCameraWithRetry();
  }

  verifyFace(): void {
    if (!this.userId || !this.capturedImage) {
      this.errorMessage = 'Utilisateur non identifié ou aucune image capturée.';
      Swal.fire('Erreur', this.errorMessage, 'error');
      this.faceVerified.emit(false);
      this.stopCamera();
      this.cdr.detectChanges();
      return;
    }

    this.isProcessing = true;
    this.isCapturing = false;
    this.cdr.detectChanges();

    this.documentService.verifyFace(this.capturedImage, this.userId).subscribe({
      next: (response: { verified: boolean; distance?: number; threshold?: number }) => {
        this.isProcessing = false;
        if (response.verified) {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Visage vérifié avec succès !',
            timer: 2000,
            showConfirmButton: false
          });
          this.faceVerified.emit(true);
        } else {
          const tips = `
            Conseils pour améliorer la vérification :
            <ul>
              <li>Assurez-vous que votre visage est bien éclairé.</li>
              <li>Positionnez votre visage face à la caméra.</li>
              <li>Évitez les lunettes ou accessoires couvrant le visage.</li>
              <li>Vérifiez que votre photo de profil est claire.</li>
            </ul>
          `;
          Swal.fire({
            icon: 'error',
            title: 'Échec de la vérification',
            html: `Le visage capturé ne correspond pas à votre photo de profil.<br>
                   Distance: ${response.distance?.toFixed(3) || 'N/A'}, Seuil: ${response.threshold?.toFixed(3) || 'N/A'}<br>
                   ${tips}`,
            showConfirmButton: true,
            confirmButtonText: 'Réessayer',
            showCancelButton: true,
            cancelButtonText: 'Annuler'
          }).then((result) => {
            if (result.isConfirmed) this.retryCapture();
            else {
              this.faceVerified.emit(false);
              this.stopCamera();
            }
          });
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.isProcessing = false;
        let errorMessage = 'Erreur lors de la vérification faciale.';
        if (error.status === 404) {
          errorMessage = 'Veuillez télécharger une photo de profil.';
          Swal.fire({
            icon: 'info',
            title: 'Photo manquante',
            html: `${errorMessage}<br><a href="/profile">Aller au profil</a>`,
            confirmButtonText: 'OK'
          });
        } else if (error.status === 400) {
          errorMessage = error.error?.detail || 'Données invalides.';
          Swal.fire({
            icon: 'error',
            title: 'Erreur de positionnement',
            html: errorMessage,
            confirmButtonText: 'Réessayer',
            showCancelButton: true,
            cancelButtonText: 'Annuler'
          }).then((result) => {
            if (result.isConfirmed) this.retryCapture();
            else this.stopCamera();
          });
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur.';
          Swal.fire('Erreur', errorMessage, 'error');
        }
        this.faceVerified.emit(false);
        this.stopCamera();
        this.cdr.detectChanges();
      }
    });
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      this.stream = null;
    }
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }
    this.isCapturing = false;
    this.isProcessing = false;
    this.capturedImage = null;
    this.cdr.detectChanges();
  }

  retryCamera(): void {
    this.errorMessage = '';
    this.isCapturing = true;
    this.cdr.detectChanges();
    this.startCameraWithRetry();
  }
}

import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserInfoService, UserProfile, UserSummary } from '@/app/services/userinfo.service';
import { PostCommentService, Post, Comment } from '@/app/services/postcomment.service';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userInfoService = inject(UserInfoService);
  private postCommentService = inject(PostCommentService);
  private keycloakService = inject(KeycloakService);
  private fb = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  userId: string = '';
  userProfile: UserProfile | null = null;
  profilePhotoUrl: string = 'assets/images/users/avatar-1.jpg';
  defaultProfilePhoto: string = 'assets/images/users/avatar-1.jpg';
  isLoading: boolean = true;
  errorMessage: string | null = null;
  isOwnProfile: boolean = false;
  isFollowing: boolean = false;

  userName: string = '';
  lastName: string = '';
  userEmail: string = '';

  followerCount: number = 0;
  followingCount: number = 0;

  isEditing: boolean = false;
  editForm: FormGroup;
  postForm: FormGroup;
  commentForms: { [postId: number]: FormGroup } = {};
  replyForms: { [key: string]: FormGroup } = {};
  skills: string[] = ['Javascript', 'Python', 'Angular', 'Reactjs', 'Flutter'];
  socialMedia = {
    facebook: { followers: '25k' },
    twitter: { followers: '58k' },
  };
  posts: Post[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.editForm = this.fb.group({
      birthdate: ['', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      position: [''],
      education: [''],
      languages: [''],
      phoneNumber: [''],
      email: [{ value: '', disabled: true }],
    });

    this.postForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  get isFormInvalid(): boolean {
    return this.editForm?.invalid ?? false;
  }

  async ngOnInit(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        await this.keycloakService.login();
        return;
      }

      const userProfile: KeycloakProfile = await this.keycloakService.loadUserProfile();
      const authenticatedUserId = userProfile.id ?? '';
      if (!authenticatedUserId) {
        throw new Error('Authenticated user ID is not available.');
      }

      this.userId = this.route.snapshot.paramMap.get('id') ?? authenticatedUserId;

      this.userName = userProfile.firstName ?? 'Utilisateur';
      this.lastName = userProfile.lastName ?? '';
      this.userEmail = userProfile.email ?? 'Email non disponible';

      console.log('Route userId:', this.userId);
      console.log('Authenticated userId:', authenticatedUserId);

      this.isOwnProfile = this.userId === authenticatedUserId;

      await Promise.all([
        this.loadProfile(),
        this.fetchProfilePhoto(),
        this.loadFollowData(),
        this.loadPosts(),
        !this.isOwnProfile ? this.checkFollowingStatus(authenticatedUserId) : Promise.resolve(),
      ]);
    } catch (error: unknown) {
      this.errorMessage = 'Erreur lors de la récupération des informations utilisateur.';
      this.isLoading = false;
      console.error('Error:', error);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadProfile(): Promise<void> {
    try {
      if (!this.userId) {
        throw new Error('User ID is not set.');
      }

      const profileObservable: Observable<UserProfile> = await this.userInfoService.getUserProfile(this.userId);
      profileObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (profile: UserProfile) => {
          this.userProfile = profile;
          this.userName = profile.username || this.userName;
          this.userEmail = profile.email || this.userEmail;
          this.editForm.patchValue({
            birthdate: profile.birthdate || '',
            position: profile.position || '',
            education: profile.education || '',
            languages: profile.languages || '',
            phoneNumber: profile.phoneNumber || '',
            email: profile.email || this.userEmail,
          });
          this.isLoading = false;
        },
        error: (error: any) => {
          let errorMessage = 'Erreur lors du chargement du profil.';
          if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion ou assurez-vous que le serveur est en cours d\'exécution.';
          } else if (error.status === 404) {
            errorMessage = 'Profil non trouvé pour cet utilisateur.';
          } else if (error.status === 403) {
            errorMessage = 'Interdit : Vous n\'avez pas la permission de voir ce profil.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.errorMessage = errorMessage;
          this.isLoading = false;
          console.error('Error loading profile:', error);
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de la récupération du profil.';
      this.errorMessage = errorMsg || 'Erreur lors de la récupération du profil.';
      this.isLoading = false;
      console.error('Error:', error);
    }
  }

  private async fetchProfilePhoto(): Promise<void> {
    try {
      const photoObservable: Observable<Blob> = await this.userInfoService.getProfilePhoto(this.userId);
      photoObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (blob: Blob) => {
          if (blob && blob.size > 0) {
            this.profilePhotoUrl = URL.createObjectURL(blob);
          } else {
            this.profilePhotoUrl = this.defaultProfilePhoto;
          }
        },
        error: (error: Error) => {
          console.warn('No profile photo found or error fetching photo:', error.message);
          this.profilePhotoUrl = this.defaultProfilePhoto;
          if (error.message.includes('403')) {
            this.errorMessage = 'Interdit : Vous ne pouvez accéder qu\'à votre propre photo de profil.';
          } else if (error.message.includes('401')) {
            this.errorMessage = 'Non autorisé : Veuillez vous reconnecter.';
          }
        },
      });
    } catch (error: unknown) {
      console.error('Error initiating profile photo fetch:', error);
      this.profilePhotoUrl = this.defaultProfilePhoto;
    }
  }

  private async loadFollowData(): Promise<void> {
    try {
      const followersObservable: Observable<UserSummary[]> = await this.userInfoService.getFollowers(this.userId);
      const followingObservable: Observable<UserSummary[]> = await this.userInfoService.getFollowing(this.userId);

      followersObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (followers: UserSummary[]) => {
          this.followerCount = followers.length;
        },
        error: (error: Error) => {
          console.error('Error fetching followers:', error);
        },
      });

      followingObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (following: UserSummary[]) => {
          this.followingCount = following.length;
        },
        error: (error: Error) => {
          console.error('Error fetching following:', error);
        },
      });
    } catch (error: unknown) {
      console.error('Error loading follow data:', error);
    }
  }

  private async checkFollowingStatus(authenticatedUserId: string): Promise<void> {
    try {
      const followingObservable: Observable<UserSummary[]> = await this.userInfoService.getFollowing(authenticatedUserId);
      followingObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (following: UserSummary[]) => {
          this.isFollowing = following.some((user) => user.id === this.userId);
        },
        error: (error: Error) => {
          console.error('Error checking following status:', error);
        },
      });
    } catch (error: unknown) {
      console.error('Error checking following status:', error);
    }
  }

  private async loadPosts(): Promise<void> {
    try {
      const postsObservable = await this.postCommentService.getPostsByUserId(this.userId);
      postsObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (posts: Post[]) => {
          this.posts = posts;
          this.posts.forEach((post) => {
            this.commentForms[post.id!] = this.fb.group({
              text: ['', [Validators.required, Validators.maxLength(500)]],
            });
            post.comments?.forEach((comment) => {
              this.replyForms[`${post.id}-${comment.id}`] = this.fb.group({
                text: ['', [Validators.required, Validators.maxLength(500)]],
              });
            });
          });
        },
        error: (error: any) => {
          let errorMessage = 'Erreur lors du chargement des publications.';
          if (error.status === 500) {
            errorMessage = `Erreur serveur: ${error.error || 'Impossible de récupérer les publications.'}`;
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé : Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Interdit : Vous n\'avez pas la permission de voir ces publications.';
          } else if (error.status === 404) {
            errorMessage = 'Utilisateur non trouvé.';
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.errorMessage = errorMessage;
          console.error('Error loading posts:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors du chargement des publications.';
      this.errorMessage = errorMsg;
      console.error('Error loading posts:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  }

  async createPost(): Promise<void> {
    if (this.postForm.invalid) {
      this.errorMessage = 'Veuillez entrer un contenu valide pour la publication (max 500 caractères).';
      return;
    }

    const post: Post = {
      content: this.postForm.value.content,
    };

    try {
      const postObservable = await this.postCommentService.createPost(post);
      postObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (createdPost: Post) => {
          this.posts.unshift(createdPost);
          this.commentForms[createdPost.id!] = this.fb.group({
            text: ['', [Validators.required, Validators.maxLength(500)]],
          });
          this.postForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Publication créée avec succès !',
            confirmButtonText: 'OK',
          });
        },
        error: (error: any) => {
          let errorMessage = 'Erreur lors de la création de la publication.';
          if (error.status === 415) {
            errorMessage = 'Format de données invalide. Assurez-vous que le contenu est correctement formaté.';
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé : Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Interdit : Vous n\'avez pas la permission de créer une publication.';
          } else if (error.status === 400) {
            errorMessage = 'Contenu invalide : Vérifiez que le texte est non vide et respecte les limites.';
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.errorMessage = errorMessage;
          console.error('Error creating post:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de la création de la publication.';
      this.errorMessage = errorMsg;
      console.error('Error creating post:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  }

  async addComment(postId: number): Promise<void> {
    const commentForm = this.commentForms[postId];
    if (commentForm.invalid) {
      this.errorMessage = 'Veuillez entrer un contenu valide pour le commentaire (max 500 caractères).';
      return;
    }

    const comment: Comment = {
      text: commentForm.value.text,
    };

    try {
      const commentObservable = await this.postCommentService.addComment(postId, comment);
      commentObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (updatedPost: Post) => {
          const postIndex = this.posts.findIndex((p) => p.id === postId);
          if (postIndex !== -1) {
            // Update only the content since the backend returns PostDTO
            this.posts[postIndex].content = updatedPost.content;
            // Note: Comments are not updated in the UI since PostDTO doesn't include them
            // Fetch posts again if comments need to be updated
            this.loadPosts();
          }
          commentForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Commentaire ajouté avec succès !',
            confirmButtonText: 'OK',
          });
        },
        error: (error: any) => {
          let errorMessage = 'Erreur lors de l\'ajout du commentaire.';
          if (error.status === 500) {
            errorMessage = `Erreur serveur: ${error.error || 'Impossible d\'ajouter le commentaire.'}`;
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé : Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Interdit : Vous n\'avez pas la permission d\'ajouter un commentaire.';
          } else if (error.status === 400) {
            errorMessage = error.error?.text || 'Contenu invalide : Vérifiez que le texte est non vide et respecte les limites.';
          } else if (error.status === 404) {
            errorMessage = 'Publication non trouvée.';
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.errorMessage = errorMessage;
          console.error('Error adding comment:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'ajout du commentaire.';
      this.errorMessage = errorMsg;
      console.error('Error adding comment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  }

  async addReply(postId: number, commentId: number): Promise<void> {
    const replyForm = this.replyForms[`${postId}-${commentId}`];
    if (replyForm.invalid) {
      this.errorMessage = 'Veuillez entrer un contenu valide pour la réponse (max 500 caractères).';
      return;
    }

    const reply: Comment = {
      text: replyForm.value.text,
    };

    try {
      const replyObservable = await this.postCommentService.addReply(postId, commentId, reply);
      replyObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (updatedPost: Post) => {
          const postIndex = this.posts.findIndex((p) => p.id === postId);
          if (postIndex !== -1) {
            this.posts[postIndex].content = updatedPost.content;
            // Fetch posts again to update comments and replies
            this.loadPosts();
          }
          replyForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Réponse ajoutée avec succès !',
            confirmButtonText: 'OK',
          });
        },
        error: (error: any) => {
          let errorMessage = 'Erreur lors de l\'ajout de la réponse.';
          if (error.status === 500) {
            errorMessage = `Erreur serveur: ${error.error || 'Impossible d\'ajouter la réponse.'}`;
          } else if (error.status === 401) {
            errorMessage = 'Non autorisé : Veuillez vous reconnecter.';
          } else if (error.status === 403) {
            errorMessage = 'Interdit : Vous n\'avez pas la permission d\'ajouter une réponse.';
          } else if (error.status === 400) {
            errorMessage = error.error?.text || 'Contenu invalide : Vérifiez que le texte est non vide et respecte les limites.';
          } else if (error.status === 404) {
            errorMessage = 'Publication ou commentaire non trouvé.';
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          this.errorMessage = errorMessage;
          console.error('Error adding reply:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: errorMessage,
            confirmButtonText: 'OK',
          });
        },
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue lors de l\'ajout de la réponse.';
      this.errorMessage = errorMsg;
      console.error('Error adding reply:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: errorMsg,
        confirmButtonText: 'OK',
      });
    }
  }

  async toggleFollow(): Promise<void> {
    try {
      const authenticatedUserId = (await this.keycloakService.loadUserProfile()).id ?? '';
      if (!authenticatedUserId) {
        throw new Error('Authenticated user ID is not available.');
      }

      const actionObservable = this.isFollowing
        ? await this.userInfoService.unfollowUser(authenticatedUserId, this.userId)
        : await this.userInfoService.followUser(authenticatedUserId, this.userId);

      actionObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: (message: string) => {
          this.isFollowing = !this.isFollowing;
          this.followerCount += this.isFollowing ? 1 : -1;
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: this.isFollowing ? 'Utilisateur suivi avec succès !' : 'Utilisateur non suivi avec succès !',
            confirmButtonText: 'OK',
          });
        },
        error: (error: Error) => {
          console.error('Error toggling follow:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de l\'action de suivi/non-suivi.',
            confirmButtonText: 'OK',
          });
        },
      });
    } catch (error: unknown) {
      console.error('Error toggling follow:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Erreur lors de l\'action de suivi/non-suivi.',
        confirmButtonText: 'OK',
      });
    }
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.match('image/jpeg|image/png')) {
        Swal.fire({
          icon: 'error',
          title: 'Type de fichier invalide',
          text: 'Seuls les fichiers JPEG et PNG sont autorisés.',
          confirmButtonText: 'OK',
        });
        return;
      }

      try {
        const uploadObservable: Observable<any> = await this.userInfoService.uploadProfilePhoto(this.userId, file);
        uploadObservable.pipe(takeUntil(this.destroy$)).subscribe({
          next: (response: any) => {
            this.fetchProfilePhoto();
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Photo de profil enregistrée avec succès !',
              confirmButtonText: 'OK',
            });
          },
          error: (error: Error) => {
            console.error('Error uploading profile photo:', error.message);
            let errorMessage = 'Erreur lors de l\'upload de la photo.';
            if (error.message.includes('401')) {
              errorMessage = 'Vous n\'êtes pas autorisé à uploader une photo. Veuillez vous reconnecter.';
            } else if (error.message.includes('413')) {
              errorMessage = 'La taille du fichier est trop grande.';
            } else if (error.message.includes('403')) {
              errorMessage = 'Interdit : Vous ne pouvez uploader que votre propre photo de profil.';
            } else if (error.message.includes('400')) {
              errorMessage = error.message.split(':')[1]?.trim() || 'Requête invalide.';
            }
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: errorMessage,
              confirmButtonText: 'OK',
            });
          },
        });
      } catch (error: unknown) {
        console.error('Error initiating photo upload:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de l\'initiation de l\'upload de la photo.',
          confirmButtonText: 'OK',
        });
      }
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.userProfile) {
      this.editForm.patchValue({
        birthdate: this.userProfile.birthdate || '',
        position: this.userProfile.position || '',
        education: this.userProfile.education || '',
        languages: this.userProfile.languages || '',
        phoneNumber: this.userProfile.phoneNumber || '',
        email: this.userProfile.email || this.userEmail,
      });
    }
  }

  async saveProfile(): Promise<void> {
    if (!this.userId) return;

    if (this.isFormInvalid) {
      this.errorMessage = 'Veuillez corriger les erreurs du formulaire avant de soumettre.';
      return;
    }

    const formValue = this.editForm.value;
    if (formValue.birthdate === '') {
      delete formValue.birthdate;
    }

    console.log('Sending formValue:', formValue);
    (await this.userInfoService.updateUserProfile(this.userId, formValue))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (message: string) => {
          console.log(message);
          this.userProfile = { ...this.userProfile, ...formValue } as UserProfile;
          this.isEditing = false;
          this.errorMessage = null;
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Profil mis à jour avec succès !',
            confirmButtonText: 'OK',
          });
        },
        error: (err: Error) => {
          this.errorMessage = 'Échec de la mise à jour du profil : ' + err.message;
          console.error('Error updating profile:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.errorMessage,
            confirmButtonText: 'OK',
          });
        },
      });
  }
}

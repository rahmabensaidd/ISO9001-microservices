import { Component, OnInit } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { UserInfoService, UserProfile } from '@/app/services/userinfo.service';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styles: ``,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class PersonalInfoComponent implements OnInit {
  userProfile: UserProfile | null = null;
  userId: string | null = null;
  error: string | null = null;
  isEditing: boolean = false;
  editForm: FormGroup;
  skills: string[] = ['Javascript', 'Python', 'Angular', 'Reactjs', 'Flutter'];
  socialMedia = {
    facebook: { followers: '25k' },
    twitter: { followers: '58k' }
  };

  constructor(
    private keycloakService: KeycloakService,
    private userInfoService: UserInfoService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      birthdate: ['', [Validators.pattern(/^\d{4}-\d{2}-\d{2}$/)]],
      position: [''],
      education: [''],
      languages: [''],
      phoneNumber: [''],
      email: [{ value: '', disabled: true }]
    });
  }

  get isFormInvalid(): boolean {
    return this.editForm?.invalid ?? false;
  }

  async ngOnInit() {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        await this.keycloakService.login();
        return;
      }

      const userProfile = await this.keycloakService.loadUserProfile();
      this.userId = userProfile.id || null;
      if (this.userId) {
        (await this.userInfoService.getUserProfile(this.userId)).subscribe({
          next: (profile: UserProfile) => {
            this.userProfile = profile;
            this.editForm.patchValue({
              birthdate: profile.birthdate || '',
              position: profile.position || '',
              education: profile.education || '',
              languages: profile.languages || '',
              phoneNumber: profile.phoneNumber || '',
              email: profile.email || ''
            });
          },
          error: (err: any) => {
            this.error = 'Failed to load profile: ' + err.message;
          }
        });
      }
    } catch (err) {
      this.error = 'Failed to load user profile: ' + (err instanceof Error ? err.message : String(err));
    }
  }

  async logout() {
    await this.keycloakService.logout();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing && this.userProfile) {
      this.editForm.patchValue({
        birthdate: this.userProfile.birthdate || '',
        position: this.userProfile.position || '',
        education: this.userProfile.education || '',
        languages: this.userProfile.languages || '',
        phoneNumber: this.userProfile.phoneNumber || '',
        email: this.userProfile.email || ''
      });
    }
  }

  async saveProfile() {
    if (!this.userId) return;

    if (this.isFormInvalid) {
      this.error = 'Please fix the form errors before submitting.';
      return;
    }

    const formValue = this.editForm.value;
    if (formValue.birthdate === '') {
      delete formValue.birthdate;
    }

    console.log('Sending formValue:', formValue);
    (await this.userInfoService.updateUserProfile(this.userId, formValue)).subscribe({
      next: (message: string) => {
        console.log(message);
        this.userProfile = { ...this.userProfile, ...formValue };
        this.isEditing = false;
      },
      error: (err: any) => {
        this.error = 'Failed to update profile: ' + err.message;
      }
    });
  }
}

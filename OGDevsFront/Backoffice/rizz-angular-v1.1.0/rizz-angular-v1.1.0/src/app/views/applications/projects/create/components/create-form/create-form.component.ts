import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { ProjectService } from '@/app/services/project.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Process} from "@core/models/project.model";
import { NgSelectModule } from '@ng-select/ng-select';
import {DatepickerDirective} from "@core/directive/datepickr.directive";
import Swal from "sweetalert2";

@Component({
  selector: 'create-form',
  imports: [FormsModule, CommonModule, NgSelectModule, DatepickerDirective],
  templateUrl: './create-form.component.html',
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      /* Base Form Styles */
      form {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }

      /* Labels */
      .form-label {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
        display: block;
        font-size: 14px;
      }

      /* Inputs */
      .form-control {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 10px 15px;
        font-size: 14px;
        transition: all 0.3s;
        margin-bottom: 20px;
      }

      /* Placeholder en gris */
      .custom-multiselect .ng-placeholder {
        color: #9e9e9e !important; /* Gris moyen */
        font-weight: 400;
      }

      /* NG-SELECT Custom Styles */
      .custom-multiselect .ng-select-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        min-height: 40px;
        background: #fff;
        transition: all 0.3s;
        padding: 5px 10px;
      }

      /* Selected Items - Style Rectangulaire */
      .custom-multiselect .ng-value {
        background: #48d74d !important;
        color: white !important;
        border-radius: 4px !important; /* Rectangle au lieu de 16px pour ovale */
        padding: 4px 10px !important;
        margin-right: 5px;
        margin-bottom: 5px;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
      }

      .custom-multiselect .ng-value-icon {
        color: white !important;
        padding-left: 5px;
        opacity: 0.8;
      }

      .custom-multiselect .ng-value-icon:hover {
        opacity: 1;
        background: transparent !important;
      }

      /* Dropdown Panel */
      .custom-multiselect .ng-dropdown-panel {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        background: white !important;
        margin-top: 5px;
      }

      /* Dropdown Options */
      .custom-multiselect .ng-option {
        padding: 10px 15px;
        color: #333;
        transition: all 0.2s;
      }

      .custom-multiselect .ng-option.ng-option-selected {
        background: #f1f8f1 !important;
        color: #48d74d !important;
        font-weight: 500;
      }

      .custom-multiselect .ng-option.ng-option-marked {
        background: #f8f9fa !important;
        color: #48d74d;
      }

      /* Date Inputs */
      input[type='date'] {
        height: 40px;
        padding: 10px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        color: #333;
      }

      /* Placeholder des inputs date */
      input[type='date']::placeholder {
        color: #9e9e9e;
      }

      /* Buttons */
      .btn {
        border-radius: 8px;
        padding: 10px 20px;
        font-weight: 500;
        transition: all 0.3s;
      }

      .btn-create {
        background-color: #56cc5a;
        border-color: #62d966;
        color: white;
      }

      .btn-create:hover {
        background-color: #3bc340;
        border-color: #3bc340;
        color: white;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .row > div {
          width: 100%;
          margin-bottom: 15px;
        }
      }
      .gap-3 {
        gap: 1rem !important; /* Espacement entre les deux champs */
      }

      .small {
        font-size: 0.875rem;
      }

      /* Ajustement spécifique pour les champs date */
      input[type='date'] {
        width: 100%;
        height: 38px;
        padding: 0.375rem 0.75rem;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
      }

      /* Responsive pour petits écrans */
      @media (max-width: 576px) {
        .d-flex {
          flex-direction: column;
        }
        .gap-3 {
          gap: 0.5rem !important;
        }
      }
    `,
  ],
  standalone: true,
})
export class CreateFormComponent implements OnInit {
  project = {
    name: '',
    description: '',
    start_Date: new Date().toISOString().split('T')[0],
    expected_endDate: new Date().toISOString().split('T')[0],
    projectType: '',
    requirements: <string[]>[],
  }

  processList: Process[] = []
  selectedProcesses: number[] = []
  projectTypes: { label: string; value: string }[] = [
    {
      label: 'Systems & Embedded Development',
      value: 'Systems & Embedded Development',
    },
    {
      label: 'Industry-Specific Projects',
      value: 'Industry-Specific Projects',
    },
    { label: 'Data Science & AI', value: 'Data Science & AI' },
    {
      label: 'Desktop Application Development',
      value: 'Desktop Application Development',
    },
    {
      label: 'Mobile Application Development',
      value: 'Mobile Application Development',
    },
  ]

  requirementOptions: { label: string; value: string }[] = [
    { label: 'Scalability', value: 'Scalability' },
    { label: 'Security', value: 'Security' },
    { label: 'Performance', value: 'Performance' },
    { label: 'Availability', value: 'Availability' },
    { label: 'Accessibility', value: 'Accessibility' },
    { label: 'Maintainability', value: 'Maintainability' },
    { label: 'Usability', value: 'Usability' },
    { label: 'Portability', value: 'Portability' },
    { label: 'Reliability', value: 'Reliability' },
    { label: 'Testability', value: 'Testability' },
    { label: 'Compliance', value: 'Compliance' },
    { label: 'Interoperability', value: 'Interoperability' },
    { label: 'Documentation', value: 'Documentation' },
  ]

  constructor(
    private router: Router,
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private projectService: ProjectService
  ) {}

  async createProject(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const userProfile: KeycloakProfile = await this.keycloakService.loadUserProfile();
      const currentUserEmail = userProfile.email;

      if (!currentUserEmail) {
        console.error("❌ User email is not available.");
        Swal.fire('Error', "User email is not available.", 'error');
        return;
      }

      const token = await this.keycloakService.getToken();
      if (!token) {
        console.error('❌ Missing or invalid token');
        await this.keycloakService.login();
        return;
      }

      const backendUrl = `http://localhost:8089/api/projects/create/${encodeURIComponent(currentUserEmail)}/${this.selectedProcesses.join(',')}`;
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      console.log('✅ Project to be sent:', this.project);
      console.log('✅ URL:', backendUrl);

      this.http.post(backendUrl, this.project, {
        headers,
        observe: 'response',
        responseType: 'text',
      }).subscribe({
        next: (response) => {
          Swal.fire({
            icon: 'success',
            title: 'Project Created',
            text: 'The project has been successfully created!',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['/projectslist']);
          });
          console.log('✅ Project created successfully:', response);
        },
        error: (error) => {
          console.error('❌ HTTP Error:', error);
          Swal.fire('Error', "Failed to create the project.", 'error');
        },
      });
    } catch (error) {
      console.error("❌ Error while creating the project:", error);
      Swal.fire('Error', "An unexpected error occurred while creating the project.", 'error');
    }
  }


  loadProcesses(): void {
    this.projectService.getAllProcesses().subscribe({
      next: (data: Process[]) => {
        this.processList = data
      },
      error: (err: HttpErrorResponse) => {
        console.error(
          '❌ Erreur lors de la récupération des processus :',
          err.message
        )
      },
    })
  }

  ngOnInit(): void {
    this.loadProcesses()
  }
}

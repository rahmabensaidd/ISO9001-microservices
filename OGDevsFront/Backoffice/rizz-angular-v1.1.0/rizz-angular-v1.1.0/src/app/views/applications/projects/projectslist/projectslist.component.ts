import {Component, OnInit, ViewChild} from '@angular/core';
import { ProjectService } from "@/app/services/project.service";
import { CommonModule, NgClass } from '@angular/common';
import { Router } from "@angular/router";
import { Project } from "@core/models/project.model";
import {NgbModal, NgbPagination, NgbTooltip} from "@ng-bootstrap/ng-bootstrap";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {KeycloakProfile} from "keycloak-js";
import {KeycloakService} from "keycloak-angular";
import Swal from "sweetalert2";

interface Technology {
  name: string;
  type: string;
  description: string;
}
interface ExtendedProject extends Project {
  isCollapsed: boolean;
  showTeam: boolean; // Track if team is shown
}

interface DisplayProject extends Project {
  isCollapsed: boolean;
  showTeam: boolean; // Add showTeam property
  start_Date: string; // Formatted date
  expected_endDate: string; // Formatted date
}

@Component({
  selector: 'app-projectslist',
  templateUrl: './projectslist.component.html',
  styleUrls: ['./projectslist.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgbTooltip,
    NgbPagination,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class ProjectslistComponent implements OnInit {
  page = 1;
  pageSize = 4;
  collectionSize = 0;
  allprojects = 4; // Valeur initiale liée à pageSize
  currentUserEmail: string | null | undefined = null;
  selectedProject: any;
  allProjectsData: DisplayProject[] = [];
  projects: DisplayProject[] = [];
  today: Date = new Date();

  loading: { [key: number]: boolean } = {};

  @ViewChild('editModal') editModal: any;
  constructor(
    private modalService: NgbModal,
    private projectService: ProjectService,
    private router: Router,
    private keycloakService: KeycloakService
  ) {}


  async ngOnInit() {
    this.getAllProjects();
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (!isLoggedIn) {
      console.warn("⚠️ User is not logged in.");
      await this.keycloakService.login();
      return;
    }

    const userProfile: KeycloakProfile = await this.keycloakService.loadUserProfile();
    this.currentUserEmail = userProfile.email;
  }

  getAllProjects(): void {
    this.projectService.getAllProjects().subscribe(
      (response: Project[]) => {
        this.allProjectsData = response.map((project) => ({
          ...project,
          start_Date: this.formatDate(project.start_Date),
          expected_endDate: this.formatDate(project.expected_endDate),
          isCollapsed: true,
          showTeam: false // Initialize showTeam
        })).reverse(); // Display newest first

        this.collectionSize = this.allProjectsData.length;
        this.refreshProjects();
      },
      (error) => {
        console.error('Erreur lors de la récupération des projets:', error);
      }
    );
  }
  refreshProjects(): void {
    this.pageSize = this.allprojects;
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.projects = this.allProjectsData.slice(start, end);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }



  deleteProject(idProjet: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete the project permanently.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.projectService.deleteProject(idProjet).subscribe(
          () => {
            this.allProjectsData = this.allProjectsData.filter(
              (project) => project.idProjet !== idProjet
            );
            this.collectionSize = this.allProjectsData.length;
            this.refreshProjects();

            Swal.fire({
              title: 'Deleted!',
              text: 'The project has been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          (error) => {
            console.error(`Erreur lors de la suppression du projet avec ID ${idProjet}:`, error);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while deleting the project.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        );
      }
    });
  }


  updateProject(project: any) {
    this.selectedProject = { ...project }; // clone pour éviter la modification directe
    this.modalService.open(this.editModal, { centered: true });
  }
  startManagingProject(project: Project): void {
    this.router.navigate(['/manage_project', project.idProjet]);
  }



  saveChanges(modal: any) {
    this.projectService.updateProject(this.selectedProject.idProjet, this.selectedProject).subscribe(
      (res) => {
        // Mettre à jour dans la liste principale
        const index = this.allProjectsData.findIndex(p => p.idProjet === this.selectedProject.idProjet);
        if (index > -1) {
          this.allProjectsData[index] = { ...this.selectedProject };
          this.refreshProjects();
        }

        Swal.fire({
          title: 'Success!',
          text: 'The project has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#5156be'
        });

        modal.close();
      },
      (error) => {
        console.error('Erreur lors de la mise à jour du projet:', error);

        Swal.fire({
          title: 'Error',
          text: 'An error occurred while updating the project.',
          icon: 'error',
          confirmButtonColor: '#5156be'
        });
      }
    );
  }


  onItemsPerPageChange(): void {
    this.page = 1; // On revient à la première page
    this.pageSize = this.allprojects;
    this.refreshProjects();
  }



  getDaysSince(startDate: string | Date): number {
    const start = new Date(startDate).getTime();
    const today = new Date().getTime();
    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }


  isLaunched(startDate: string): boolean {
    return new Date(startDate) <= this.today;
  }

  toggleTeam(project: DisplayProject): void {
    project.showTeam = !project.showTeam; // Toggle team visibility
  }

  getTeamMembers(project: Project): { id: string; username: string; email: string }[] {
    const users: { id: string; username: string; email: string }[] = [];
    const userIds = new Set<string>();

    // Iterate through all phases and their operations
    project.phases.forEach(phase => {
      phase.projectOperations.forEach(operation => {
        if (operation.user && !userIds.has(operation.user.id)) {
          users.push({
            id: operation.user.id,
            username: operation.user.username,
            email: operation.user.email
          });
          userIds.add(operation.user.id); // Ensure no duplicates
        }
      });
    });

    return users;
  }

}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Resource } from '@core/models/project.model';
import { ProjectService } from '@/app/services/project.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CurrencyPipe, NgClass, NgForOf, NgIf } from '@angular/common';
import {NgbModal, NgbPagination, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";

interface User {
  email: string;
  username: string;
}

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
  standalone: true,
    imports: [
        FormsModule,
        NgForOf,
        NgClass,
        NgbPagination,
        NgIf,
        CurrencyPipe,
        ReactiveFormsModule,
        NgbTooltip,
    ],
})
export class ResourcesComponent implements OnInit {
  resources: Resource[] = []
  users: User[] = []
  newResource: Resource = {
    resourceId: 0,
    resourceName: '',
    price: 0,
    status: 'Available',
    type: '',
  }
  selectedResource: Resource | null = null
  selectedResourceId: number | null = null
  currentPage: number = 1
  pageSize: number = 5
  formSubmitted: boolean = false
  userForm: FormGroup

  constructor(
    private resourceService: ProjectService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      userId: [''],
    })
  }

  ngOnInit(): void {
    this.loadResources()
    this.fetchUsers()
  }

  fetchUsers(): void {
    this.resourceService.getAllUsers().subscribe({
      next: (data: User[]) => {
        this.users = data
        console.log('Users loaded:', this.users)
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', err)
      },
    })
  }

  loadResources(): void {
    this.resourceService.getAllResources().subscribe(
      (data: Resource[]) => {
        this.resources = data
        console.log('Resources loaded:', this.resources.length, this.resources)
        this.adjustCurrentPage()
        this.cdr.detectChanges()
      },
      (error: any) => {
        console.error('Error fetching resources', error)
      }
    )
  }

  addResource(resourceForm: any): void {
    this.formSubmitted = true;
    if (resourceForm.valid) {
      this.resourceService.addResource(this.newResource).subscribe(
        (data: Resource) => {
          this.resources.push(data);
          this.resetNewResource();
          resourceForm.resetForm();
          this.formSubmitted = false;
          this.adjustCurrentPage();
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Resource Added',
            text: 'The resource has been added successfully!',
          });
        },
        (error: any) => {
          console.error('Error adding resource', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while adding the resource.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Fields',
        text: 'Please fill in all required fields to add a resource.',
      });
    }
  }


  deleteResource(resourceId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "This resource will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resourceService.deleteResource(resourceId).subscribe(
          () => {
            this.resources = this.resources.filter(
              (resource) => resource.resourceId !== resourceId
            );
            this.adjustCurrentPage();
            this.cdr.detectChanges();

            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The resource has been deleted.',
            });
          },
          (error: any) => {
            console.error('Error deleting resource', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'An error occurred while deleting the resource.',
            });
          }
        );
      }
    });
  }


  openEditModal(template: any, resource: Resource): void {
    this.selectedResource = { ...resource }
    this.modalService.open(template, { ariaLabelledBy: 'modal-basic-title' })
  }

  updateResource(editForm: any): void {
    if (this.selectedResource && editForm.valid) {
      this.resourceService.updateResource(this.selectedResource).subscribe(
        (data: Resource) => {
          const index = this.resources.findIndex(
            (r) => r.resourceId === this.selectedResource!.resourceId
          );
          if (index !== -1) {
            this.resources[index] = { ...data };
          }
          this.modalService.dismissAll();
          this.selectedResource = null;
          this.cdr.detectChanges();

          Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Resource updated successfully.',
          });
        },
        (error: any) => {
          console.error('Error updating resource', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An error occurred while updating the resource.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Invalid Input',
        text: 'Please fill all required fields correctly before updating.',
      });
    }
  }


  showAddUserModal(resourceId: number, modal: any): void {
    this.selectedResourceId = resourceId
    this.userForm.reset()
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' })
  }

  saveUserAssignment(): void {
    if (this.selectedResourceId !== null) {
      const userId = this.userForm.get('userId')?.value;
      if (userId) {
        this.resourceService
          .assignResourceToUser(this.selectedResourceId, userId)
          .subscribe(
            () => {
              this.loadResources();
              this.modalService.dismissAll();
              this.selectedResourceId = null;

              Swal.fire({
                icon: 'success',
                title: 'User Assigned',
                text: 'The user has been successfully assigned to the resource.',
              });
            },
            (error: any) => {
              console.error('Error assigning user:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while assigning the user.',
              });
            }
          );
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'No User Selected',
          text: 'Please select a user to assign to this resource.',
        });
      }
    }
  }


  resetNewResource(): void {
    this.newResource = {
      resourceId: 0,
      resourceName: '',
      price: 0,
      status: 'Available',
      type: '',
    }
  }

  getResourcesForCurrentPage(): Resource[] {
    const startIndex = (this.currentPage - 1) * this.pageSize
    const endIndex = startIndex + this.pageSize
    const pageResources = this.resources.slice(startIndex, endIndex)
    console.log(
      `Page ${this.currentPage}, startIndex: ${startIndex}, endIndex: ${endIndex}, resources:`,
      pageResources
    )
    return pageResources
  }

  adjustCurrentPage(): void {
    const maxPage = Math.ceil(this.resources.length / this.pageSize) || 1
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage
    }
    console.log(
      `Adjusted currentPage to ${this.currentPage}, maxPage: ${maxPage}`
    )
  }

  onPageChange(page: number): void {
    this.currentPage = page
    console.log('Page changed to:', this.currentPage)
    this.cdr.detectChanges()
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-success'
      case 'in use':
        return 'bg-warning'
      case 'maintenance':
        return 'bg-danger'
      default:
        return 'bg-secondary'
    }
  }

  unassignResource(resourceId: number, userId: string): void {
    Swal.fire({
      title: 'Confirm unassignment?',
      text: 'The user will be detached from this resource.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resourceService.unassignResourceFromUser(resourceId, userId).subscribe({
          next: (updatedResource: Resource) => {
            this.loadResources();
            Swal.fire('Unassigned', 'Resource successfully unassigned.', 'success');
          },
          error: (error: any) => {
            console.error('Error during unassignment:', error);
            Swal.fire('Error', 'Failed to unassign the resource.', 'error');
          }
        });
      }
    });
  }


}

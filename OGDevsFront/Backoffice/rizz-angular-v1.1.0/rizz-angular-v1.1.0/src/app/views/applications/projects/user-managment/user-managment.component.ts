import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  NgbDropdownModule,
  NgbNavModule,
  NgbTooltipModule,
  NgbModal,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { User, UserRepresentation, Role, NewUser } from '@core/models/user.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-managment',
  standalone: true,
  imports: [
    NgbDropdownModule,
    NgbTooltipModule,
    NgbNavModule,
    NgbModalModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './user-managment.component.html',
  styleUrl: './user-managment.component.scss',
})
export class UserManagmentComponent implements OnInit {
  users: User[] = [];
  newUser: NewUser = { id: '', username: '', email: '', password: '', roles: [] };
  roles: Role[] = [];
  roleFormModel = { name: '', description: '', isEditing: false };
  availableRoles: string[] = [];
  updatingEmail = false;
  error: string | null = null;

  constructor(
    private keycloakService: KeycloakService,
    private http: HttpClient,
    private modalService: NgbModal
  ) {}

  async ngOnInit(): Promise<void> {
    await this.fetchAndStoreRoles();
    await this.fetchAndStoreUsers();
  }

  // TrackBy methods to optimize *ngFor loops
  trackByRoleId(index: number, role: Role): string {
    return role.id;
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  trackByRoleName(index: number, role: string): string {
    return role;
  }

  async fetchAndStoreRoles(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = 'http://localhost:8089/api/users/roles/all';

      this.http
        .get<any[]>(backendUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        })
        .subscribe({
          next: (roles) => {
            console.log('✅ Roles fetched from Keycloak:', roles);
            this.roles = roles
              .filter(role => role.id && role.name)
              .map((role) => ({
                id: role.id,
                roleName: role.name,
                description: role.description || '',
              }));
            this.availableRoles = this.roles.map((role) => role.roleName);
          },
          error: (error) => {
            console.error('❌ Error fetching roles:', error);
            this.error = 'Failed to load roles';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to load roles.',
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Authentication error:', error);
      this.error = 'Authentication error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Authentication error.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  async addRole(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = 'http://localhost:8089/api/users/roles/create';
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const roleData = {
        name: this.roleFormModel.name,
        description: this.roleFormModel.description,
      };

      this.http
        .post(backendUrl, roleData, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ Role added:', response.body);
            this.fetchAndStoreRoles();
            this.roleFormModel = { name: '', description: '', isEditing: false };
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Role added successfully!',
              confirmButtonColor: '#3085d6',
            });
            this.modalService.dismissAll();
          },
          error: (error) => {
            console.error('❌ Error adding role:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to add role: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Error adding role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while adding the role.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  editRoleStart(role: Role, content: TemplateRef<any>): void {
    this.roleFormModel = {
      name: role.roleName,
      description: role.description || '',
      isEditing: true,
    };
    this.modalService.open(content, { ariaLabelledBy: 'modal-role-title', size: 'lg' });
  }

  async updateRole(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = `http://localhost:8089/api/users/roles/update/${encodeURIComponent(this.roleFormModel.name)}`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const roleData = {
        newDescription: this.roleFormModel.description,
      };

      this.http
        .put(backendUrl, roleData, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ Role updated:', response.body);
            this.fetchAndStoreRoles();
            this.roleFormModel = { name: '', description: '', isEditing: false };
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Role updated successfully!',
              confirmButtonColor: '#3085d6',
            });
            this.modalService.dismissAll();
          },
          error: (error) => {
            console.error('❌ Error updating role:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to update role: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Error updating role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while updating the role.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = `http://localhost:8089/api/users/roles/delete/${encodeURIComponent(roleId)}`;
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .delete(backendUrl, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ Role deleted:', response.body);
            this.fetchAndStoreRoles();
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Role deleted successfully!',
              confirmButtonColor: '#3085d6',
            });
          },
          error: (error) => {
            console.error('❌ Error deleting role:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to delete role: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Error deleting role:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while deleting the role.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  async fetchAndStoreUsers(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = 'http://localhost:8089/api/users/all';

      this.http
        .get<UserRepresentation[]>(backendUrl, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        })
        .subscribe({
          next: (users) => {
            console.log('✅ Raw backend response (users):', users);
            const validUsers = users.filter(user => {
              const isValid = user.id && typeof user.id === 'string' && user.id.trim() !== '' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id);
              if (!isValid) {
                console.warn('⚠️ Invalid user data filtered out:', user);
              }
              return isValid;
            });
            localStorage.setItem('allUsers', JSON.stringify(validUsers));
            this.users = validUsers.map((user) => ({
              id: user.id,
              email: user.email || '',
              username: user.username || '',
              enabled: user.enabled || false,
              roles: user.roles || [],
              token: '',
              name: user.username || '',
              role: user.roles?.includes('admin') ? 'admin' : 'user',
            }));
            console.log('✅ Mapped user IDs:', this.users.map(u => u.id));
          },
          error: (error) => {
            console.error('❌ Error fetching users:', error);
            this.error = 'Failed to load users';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to load users.',
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Authentication error:', error);
      this.error = 'Authentication error';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Authentication error.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  async addUser(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = 'http://localhost:8089/api/users/create';
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const userData = {
        username: this.newUser.username,
        email: this.newUser.email,
        password: this.newUser.password,
        roles: this.newUser.roles,
      };

      this.http
        .post(backendUrl, userData, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ User added:', response.body);
            this.fetchAndStoreUsers();
            this.newUser = { id: '', username: '', email: '', password: '', roles: [] };
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'User added successfully!',
              confirmButtonColor: '#3085d6',
            });
            this.modalService.dismissAll();
          },
          error: (error) => {
            console.error('❌ Error adding user:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to add user: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Error adding user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while adding the user.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  editUserStart(user: User, content: TemplateRef<any>): void {
    if (!user.id || user.id.trim() === '' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.id)) {
      console.error('❌ Invalid or missing user ID:', user);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a valid user with an appropriate UUID.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    this.newUser = {
      id: user.id,
      username: user.username || '',
      email: user.email || '',
      password: '',
      roles: user.roles ? [...user.roles] : [],
    };
    console.log('✅ Editing user:', this.newUser);
    this.modalService.open(content, { ariaLabelledBy: 'modal-user-title', size: 'lg' });
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = `http://localhost:8089/api/users/delete/${encodeURIComponent(userId)}`;
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .delete(backendUrl, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ User deleted:', response.body);
            this.fetchAndStoreUsers();
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'User deleted successfully!',
              confirmButtonColor: '#3085d6',
            });
          },
          error: (error) => {
            console.error('❌ Error deleting user:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to delete user: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while deleting the user.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  async updateUserEmail(userId: string): Promise<void> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!userId || userId.trim() === '' || !uuidRegex.test(userId)) {
      console.error('❌ Invalid or undefined User ID:', userId);
      console.trace('Call stack for invalid user ID');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a valid user with an appropriate UUID for the update.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!this.newUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      console.error('❌ Invalid email address:', this.newUser.email);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please provide a valid email address.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (this.updatingEmail) return;
    this.updatingEmail = true;

    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = `http://localhost:8089/api/users/update-email/${encodeURIComponent(userId)}`;
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const userData = {
        newEmail: this.newUser.email,
      };

      this.http
        .put(backendUrl, userData, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ User email updated:', response.body);
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Email updated successfully!',
              confirmButtonColor: '#3085d6',
            });
            this.fetchAndStoreUsers();
            this.newUser = { id: '', username: '', email: '', password: '', roles: [] };
            this.modalService.dismissAll();
          },
          error: (error) => {
            console.error('❌ Error updating email:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to update email: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
          complete: () => {
            this.updatingEmail = false;
          },
        });
    } catch (error) {
      console.error('❌ Error updating email:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while updating the email.',
        confirmButtonColor: '#3085d6',
      });
      this.updatingEmail = false;
    }
  }

  async updateUser(userId: string): Promise<void> {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!userId || userId.trim() === '' || !uuidRegex.test(userId)) {
      console.error('❌ Invalid or undefined User ID:', userId);
      console.trace('Call stack for invalid user ID');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a valid user with an appropriate UUID for the update.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    if (!this.newUser.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newUser.email)) {
      console.error('❌ Invalid email address:', this.newUser.email);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please provide a valid email address.',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn("⚠️ User is not logged in.");
        await this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const backendUrl = `http://localhost:8089/api/users/update-email/${encodeURIComponent(userId)}`;
      console.log('Updating email at URL:', backendUrl, 'with data:', { newEmail: this.newUser.email });
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });

      const userData = {
        newEmail: this.newUser.email,
      };

      this.http
        .put(backendUrl, userData, {
          headers,
          observe: 'response',
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('✅ User email updated:', response.body);
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Email updated successfully!',
              confirmButtonColor: '#3085d6',
            });
            this.fetchAndStoreUsers();
            this.newUser = { id: '', username: '', email: '', password: '', roles: [] };
            this.modalService.dismissAll();
          },
          error: (error: HttpErrorResponse) => {
            console.error('❌ Error updating user:', error);
            console.log('Status:', error.status, 'Message:', error.message, 'Error Details:', error.error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: `Failed to update user: ${error.statusText || 'Unknown error'}`,
              confirmButtonColor: '#3085d6',
            });
          },
        });
    } catch (error) {
      console.error('❌ Error updating user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred while updating the user.',
        confirmButtonColor: '#3085d6',
      });
    }
  }

  onRoleChange(event: Event, role: string): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.newUser.roles = [...this.newUser.roles, role];
    } else {
      this.newUser.roles = this.newUser.roles.filter(r => r !== role);
    }
  }

  openUserModal(content: TemplateRef<any>): void {
    this.newUser = { id: '', username: '', email: '', password: '', roles: [] };
    this.modalService.open(content, { ariaLabelledBy: 'modal-user-title', size: 'lg' });
  }

  openRoleModal(content: TemplateRef<any>): void {
    this.roleFormModel = { name: '', description: '', isEditing: false };
    this.modalService.open(content, { ariaLabelledBy: 'modal-role-title', size: 'lg' });
  }
}

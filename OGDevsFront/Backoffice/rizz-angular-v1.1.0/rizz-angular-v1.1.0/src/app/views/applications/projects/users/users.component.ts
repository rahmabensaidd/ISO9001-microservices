import { Component, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableFooterComponent } from '@/app/components/table/table-footer/table-footer.component';
import { TableHeaderComponent } from '@/app/components/table/table-header/table-header.component';
import { NgbdSortableHeader, SortEvent } from '@/app/core/directive/sortable.directive';
import { TableService } from '@/app/core/service/table.service';
import { KeycloakService } from 'keycloak-angular';

interface UserRepresentation {
  id: string;
  username: string;
  email: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  name: string;
  status: string;
  role: string;
  last_active: string;
  image: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    TableFooterComponent,
    NgbdSortableHeader,
  ],
  templateUrl: './users.component.html',
})
export class UsersComponent implements OnInit, OnDestroy {
  users: UserRepresentation[] = [];
  total$: Observable<number>;
  private usersSubscription: Subscription | null = null;

  @ViewChildren(NgbdSortableHeader) headers!: QueryList<NgbdSortableHeader<UserRepresentation>>;

  constructor(
    public tableService: TableService<UserRepresentation>,
    private keycloakService: KeycloakService,
    private http: HttpClient
  ) {
    this.total$ = this.tableService.total$;
  }

  ngOnInit(): void {
    this.loadUsersFromKeycloak();
  }

  ngOnDestroy(): void {
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  async loadUsersFromKeycloak(): Promise<void> {
    try {
      const isLoggedIn = await this.keycloakService.isLoggedIn();
      if (!isLoggedIn) {
        console.warn('Utilisateur non connecté. Redirection vers la page de connexion.');
        this.keycloakService.login();
        return;
      }

      const token = await this.keycloakService.getToken();
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`
      });

      const realm = 'test';
      const url = `http://localhost:8080/admin/realms/${realm}/users`;

      this.usersSubscription = this.http.get<any[]>(url, { headers }).subscribe({
        next: (users) => {
          const transformedUsers: UserRepresentation[] = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email || 'N/A',
            enabled: user.enabled,
            firstName: user.firstName,
            lastName: user.lastName,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            status: user.enabled ? 'Active' : 'Inactive',
            last_active: 'N/A',
            role: 'N/A',
            image: 'assets/images/users/default-avatar.jpg'
          }));
          this.users = transformedUsers;
          this.tableService.setItems(transformedUsers, 10);
        },
        error: (error) => console.error('Erreur lors de la récupération des utilisateurs depuis Keycloak:', error)
      });
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token Keycloak:', error);
    }
  }

  onSort(event: SortEvent<UserRepresentation>) {
    const { column, direction } = event;
    this.headers.forEach(header => {
      if (header.sortable !== column) {
        header.direction = '';
      }
    });
    this.tableService.sortColumn = column;
    this.tableService.sortDirection = direction;
  }

  async deleteUser(userId: string): Promise<void> {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      try {
        const token = await this.keycloakService.getToken();
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`
        });

        const realm = 'test';
        const url = `http://localhost:8080/admin/realms/${realm}/users/${userId}`;

        this.http.delete(url, { headers }).subscribe({
          next: () => this.loadUsersFromKeycloak(),
          error: (error) => console.error('Erreur lors de la suppression de l\'utilisateur:', error)
        });
      } catch (error) {
        console.error('Erreur lors de l\'obtention du token pour la suppression:', error);
      }
    }
  }
}

import { Component, EventEmitter, Output, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { NgbDropdown, NgbDropdownModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
import { SimplebarAngularModule } from 'simplebar-angular';
import { TabItems } from './data';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { changetheme } from '@/app/store/layout/layout-action';
import { getLayoutColor } from '@/app/store/layout/layout-selector';
import { Subject, Subscription, from, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map, catchError } from 'rxjs/operators';
import { SearchService, SearchResult } from '@/app/services/search.service';
import { SharedSearchService } from '@/app/services/shared-search.service';
import { CommonModule } from '@angular/common';
import { ProcessService } from '@/app/services/process-service.service';
import { NonConformityService } from '@/app/services/non-conformity.service';
import { NonConformityDTO } from '@core/models/nonconformance.model';
import { lastValueFrom } from 'rxjs';
import { MenuItem } from '@/app/core/models/menu.model';
import { MENU_ITEMS } from '@/app/common/menu-items';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { environment } from '@environment/environment';
import { NotificationService, ProcessNotification } from '@/app/services/NotificationService';
import { UserInfoService, UserSummary } from '@/app/services/userinfo.service';

@Component({
  selector: 'app-topbar',
  imports: [
    CommonModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    NgbNavModule,
    RouterModule,
  ],
  templateUrl: './topbar.component.html',
  standalone: true,
  styles: [`
    .alert-badge {
      position: absolute;
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      line-height: 1;
      color: #fff;
      background-color: #dc3545;
      border-radius: 10px;
      transform: translate(50%, -50%);
    }

    .cursor-pointer {
      cursor: pointer;
    }
  `],
})
export class TopbarComponent implements OnInit, OnDestroy {
  tabItems = TabItems;
  store = inject(Store);
  scrollY = 0;
  nonConformities: NonConformityDTO[] = [];
  processNotifications: ProcessNotification[] = [];
  auditNotifications: ProcessNotification[] = [];
  selectedNonConformity: NonConformityDTO | null = null;

  @Output() mobileMenuButtonClicked = new EventEmitter();

  userName: string = '';
  userEmail: string = '';
  isAdmin: boolean = false;
  userId: string = '';
  profilePhotoUrl: string;
  defaultProfilePhoto: string = 'assets/images/users/avatar-1.jpg';

  searchResults: SearchResult[] = [];
  searchQuery$ = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private processNotificationSubscription: Subscription | null = null;
  private auditNotificationSubscription: Subscription | null = null;

  private commonItems: string[] = ['welcome-text', 'app-search', 'topbar-language', 'light-dark-mode', 'profile', 'toggle', 'mobile-menu'];
  private clientOnlyItems: string[] = ['page-profile'];
  private adminOnlyItems: string[] = ['notifications'];

  pagesMenu: MenuItem | undefined;

  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private searchService: SearchService,
    private sharedSearchService: SharedSearchService,
    private processService: ProcessService,
    private nonconfservice: NonConformityService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private userInfoService: UserInfoService
  ) {
    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.handleScroll();
    this.profilePhotoUrl = this.defaultProfilePhoto;
  }

  async ngOnInit(): Promise<void> {
    if (await this.keycloakService.isLoggedIn()) {
      this.isAdmin = this.keycloakService.getUserRoles().includes('ROLE_ADMIN');
    }
    await this.getUserInfo();
    if (this.isAdmin) {
      await this.loadNonConformities();
      this.pagesMenu = MENU_ITEMS.find(item => item.key === 'pages');
      await this.notificationService.initializeWebSocketConnection();
      this.processNotificationSubscription = this.notificationService.processNotifications$.subscribe(
        (notifications) => {
          this.processNotifications = notifications;
        }
      );
      this.auditNotificationSubscription = this.notificationService.auditNotifications$.subscribe(
        (notifications) => {
          this.auditNotifications = notifications;
        }
      );
    }
    this.searchSubscription = this.searchQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) =>
          combineLatest([
            from(this.searchService.search(query)).pipe(
              switchMap(observable => observable),
              catchError(() => of([]))
            ),
            from(this.userInfoService.searchUsers(query)).pipe(
              switchMap(observable => observable),
              map((users: UserSummary[]) =>
                users.map(user => ({
                  id: user.id,
                  entityType: 'User',
                  displayName: user.username,
                  description: user.email || 'No email provided',
                  assignedUsers: [user.username]
                } as SearchResult))
              ),
              catchError(() => of([]))
            )
          ]).pipe(
            map(([searchResults, userResults]) => [...searchResults, ...userResults])
          )
        )
      )
      .subscribe({
        next: (results: SearchResult[]) => {
          this.searchResults = results;
          this.sharedSearchService.updateSearchResults(results);
        },
        error: (error: unknown) => {
          console.error('Error fetching search results:', error);
          this.searchResults = [];
          this.sharedSearchService.clearSearchResults();
        },
      });
    if (this.userId) {
      this.fetchProfilePhoto();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll);
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
    if (this.processNotificationSubscription) this.processNotificationSubscription.unsubscribe();
    if (this.auditNotificationSubscription) this.auditNotificationSubscription.unsubscribe();
    this.notificationService.disconnect();
  }

  private fetchProfilePhoto(): void {
    this.keycloakService
      .getToken()
      .then((token) => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        this.http
          .get(`${environment.apiUrl}/users/${this.userId}/profile-photo`, {
            headers,
            responseType: 'blob',
          })
          .subscribe({
            next: (blob) => {
              if (blob && blob.size > 0) {
                this.profilePhotoUrl = URL.createObjectURL(blob);
                console.log('Profile photo fetched successfully (200 OK)');
              } else {
                this.profilePhotoUrl = this.defaultProfilePhoto;
                console.log('No profile photo available, using default (200 OK)');
              }
            },
            error: (error: HttpErrorResponse) => {
              console.warn('No profile photo found or error fetching photo:', error);
              this.profilePhotoUrl = this.defaultProfilePhoto;
            },
          });
      })
      .catch((error) => {
        console.error('Error getting token:', error);
        this.profilePhotoUrl = this.defaultProfilePhoto;
      });
  }

  toggleMobileMenu() {
    this.mobileMenuButtonClicked.emit();
  }

  changeTheme() {
    const color = document.documentElement.getAttribute('data-bs-theme');
    const newColor = color === 'light' ? 'dark' : 'light';
    this.store.dispatch(changetheme({ color: newColor }));
    this.store.select(getLayoutColor).subscribe((updatedColor) => {
      document.documentElement.setAttribute('data-bs-theme', updatedColor);
    });
  }

  handleScroll = () => {
    this.scrollY = window.scrollY;
  };

  async getUserInfo(): Promise<void> {
    try {
      if (await this.keycloakService.isLoggedIn()) {
        const userProfile: KeycloakProfile = await this.keycloakService.loadUserProfile();
        this.userId = userProfile.id ?? '';
        this.userName = userProfile.username ?? 'Utilisateur';
        this.userEmail = userProfile.email ?? 'Email non disponible';
        console.log('User Info:', {
          userName: this.userName,
          userEmail: this.userEmail,
          userId: this.userId,
        });
      } else {
        console.warn('Utilisateur non connecté.');
      }
    } catch (error: unknown) {
      console.error('Erreur lors de la récupération des informations utilisateur :', error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.keycloakService.logout('http://localhost:4200/');
    } catch (error: unknown) {
      console.error('Erreur lors de la déconnexion :', error);
    }
  }

  onSearch(event: Event, dropdown: NgbDropdown | undefined): void {
    const query = (event.target as HTMLInputElement).value.trim();
    if (query.length >= 2) {
      this.searchQuery$.next(query);
      if (dropdown) {
        dropdown.open();
      } else {
        console.warn('Dropdown instance is undefined, search results will still update');
      }
    } else {
      this.searchResults = [];
      this.sharedSearchService.clearSearchResults();
      if (dropdown) {
        dropdown.close();
      } else {
        console.warn('Dropdown instance is undefined, search results cleared');
      }
    }
  }

  async navigateToDetails(result: SearchResult): Promise<void> {
    console.log('Navigating to:', result.id);
    if (result.entityType === 'User') {
      if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(result.id.toString())) {
        console.warn('Invalid UUID, attempting to resolve:', result.id);
      }
      // Navigate to the user's profile regardless of whether it's the authenticated user
      this.router.navigate(['/profile', result.id.toString()]);
    } else {
      this.router.navigate(['/tasks-operations-processes', result.id.toString()], {
        queryParams: { entityType: result.entityType },
      });
    }
    this.searchResults = [];
    this.sharedSearchService.clearSearchResults();
  }

  clearSearch(): void {
    this.searchResults = [];
    this.sharedSearchService.clearSearchResults();
  }

  async loadNonConformities(): Promise<void> {
    try {
      const nonConformitiesObservable = await this.nonconfservice.getAllNonConformities();
      this.nonConformities = await lastValueFrom(nonConformitiesObservable);
    } catch (error) {
      console.error('Failed to load non-conformities:', error);
    }
  }

  navigateToNonConformity(id: number): void {
    const nonConformity = this.nonConformities.find((nc) => nc.idNonConformity === id);
    if (nonConformity) {
      this.selectedNonConformity = nonConformity;
      this.router.navigate(['/dashboard/nonconformity'], {
        queryParams: {
          id: id.toString(),
          source: nonConformity.source,
          description: nonConformity.description,
          date: nonConformity.dateCreated,
        },
      });
    }
  }

  navigateToNonConformitydetails(id: number): void {
    const nonConformity = this.nonConformities.find((nc) => nc.idNonConformity === id);
    if (nonConformity) {
      this.selectedNonConformity = nonConformity;
      this.router.navigate(['/dashboard/nonconformity/details'], {
        queryParams: {
          id: id.toString(),
          view: 'details',
        },
      });
    }
  }

  navigateToProcessDetails(processId: number): void {
    this.router.navigate(['/tasks-operations-processes', processId.toString()], {
      queryParams: { entityType: 'Process' },
    });
  }

  navigateToAuditDetails(auditId: number): void {
    this.router.navigate(['/audits']);
  }

  viewAllNonConformities(): void {
    this.selectedNonConformity = null;
    this.router.navigate(['/dashboard/nonconformity']);
  }

  clearNotifications(): void {
    this.notificationService.clearProcessNotifications();
    this.notificationService.clearAuditNotifications();
  }

  shouldShowItem(itemKey: string): boolean {
    if (this.commonItems.includes(itemKey)) {
      return true;
    }
    if (this.isAdmin) {
      return this.adminOnlyItems.includes(itemKey);
    } else {
      return this.clientOnlyItems.includes(itemKey);
    }
  }
}

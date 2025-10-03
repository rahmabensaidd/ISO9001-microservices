// src/app/app.component.ts
import { Component, inject, ViewChild, OnInit } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RouterOutlet,
  Router,
  type Event,
} from '@angular/router';
import { TitleService } from './core/service/title.service';
import {
  NgProgressComponent,
  NgProgressModule,
  type NgProgressRef,
} from 'ngx-progressbar';
import { KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgProgressModule],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  startedClass = false;
  progressRef!: NgProgressRef;
  @ViewChild(NgProgressComponent) progressBar!: NgProgressComponent;

  private titleService = inject(TitleService);
  private router = inject(Router);
  private keycloakService = inject(KeycloakService);
  private routerSubscription!: Subscription;

  constructor() {
    this.router.events.subscribe((event: Event) => {
      this.checkRouteChange(event);
      if (event instanceof NavigationEnd) {
        this.redirectUserByRole(event.urlAfterRedirects);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    this.titleService.init();
    await this.redirectUserByRole(this.router.url);
  }

  checkRouteChange(routerEvent: Event) {
    if (routerEvent instanceof NavigationStart) {
      this.progressBar.start();
    }
    if (
      routerEvent instanceof NavigationEnd ||
      routerEvent instanceof NavigationCancel ||
      routerEvent instanceof NavigationError
    ) {
      setTimeout(() => {
        this.progressBar.complete();
      }, 200);
    }
  }

  // Récupérer le rôle de l'utilisateur et rediriger si nécessaire
  async redirectUserByRole(currentUrl: string) {
    if (await this.keycloakService.isLoggedIn()) {
      const roles = this.keycloakService.getUserRoles();
      console.log("Rôles détectés :", roles);

      if (roles.includes('ROLE_ADMIN')) {
        return;
      } else if (roles.includes('ROLE_CLIENT')) {
        // Autorise les routes commençant par /client/*, /pages/profile, et /profile/*
        if (
          !currentUrl.startsWith('/client') &&
          currentUrl !== '/pages/profile' &&
          !currentUrl.startsWith('/profile') // Allow /profile and /profile/[userId]
        ) {
          console.log(`Utilisateur avec ROLE_CLIENT redirigé de ${currentUrl} vers /client`);
          this.router.navigate(['/client']);
        }
      } else if (roles.includes('ROLE_USER')) {
        if (currentUrl !== '/') {
          this.router.navigate(['']);
        }
      } else if (roles.includes('ROLE_EMPLOYEE')) {
        if (!currentUrl.startsWith('/trainingsEmployee')) {
          console.log(`Utilisateur avec ROLE_EMPLOYEE redirigé de ${currentUrl} vers /trainingsEmployee`);
          this.router.navigate(['/trainingsEmployee']);
        }
      } else {
        if (currentUrl !== '/') {
          this.router.navigate(['/']);
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}

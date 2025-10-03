// src/app/app.config.ts
import { ApplicationConfig, APP_INITIALIZER, isDevMode, Provider } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { routes } from './app.routes';
import { rootReducer } from './store';
import { AuthenticationEffects } from './store/authentication/authentication.effects';
import { CalendarEffects } from './store/calendar/calendar.effects';
import { KanbanEffects } from './store/kanban/kanban.effects';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { DatePipe, DecimalPipe } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { initializeKeycloak } from '../keycloak-init';
import { SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { FakeBackendProvider } from './core/helpers/fake-backend';
import { authInterceptor } from './auth.interceptor';

// Typage explicite pour scrollConfig
const scrollConfig: { anchorScrolling: 'enabled'; scrollPositionRestoration: 'top' } = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};

// Définir appConfig avec un typage explicite
export const appConfig: ApplicationConfig = {
  providers: [
    // Fake backend pour les tests
    FakeBackendProvider as Provider,
    // Pipes utilitaires
    DatePipe,
    DecimalPipe,
    // Configuration du routeur avec défilement
    provideRouter(routes, withInMemoryScrolling(scrollConfig)),
    // Configuration NgRx pour la gestion d'état
    provideStore(rootReducer),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideEffects([AuthenticationEffects, CalendarEffects, KanbanEffects]),
    // Client HTTP avec Fetch et intercepteurs
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // Configuration Keycloak pour l'authentification
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true,
    } as Provider,
    // Configuration de Google Sign-In
    importProvidersFrom(SocialLoginModule),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(
              '349022456521-7ublmnfsvujbdlfll4m54f15c9i0bfh1.apps.googleusercontent.com',
              {
                scopes: 'profile email https://www.googleapis.com/auth/calendar',
                oneTapEnabled: false,
              }
            ),
          },
        ],
        onError: (err: any) => {
          console.error('Erreur lors de la configuration de Google Sign-In:', err);
        },
      } as SocialAuthServiceConfig,
    } as Provider,
    // Activer les animations Angular
    provideAnimations(),
    // Provide ToastrService for ngx-toastr
    provideToastr({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
  ],
};

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard extends KeycloakAuthGuard implements CanActivate {
  constructor(protected override router: Router, protected keycloak: KeycloakService) {
    super(router, keycloak);
  }

  async isAccessAllowed(): Promise<boolean> {
    if (!this.authenticated) {
      await this.keycloak.login();
      return false;
    }
    return true;
  }
}

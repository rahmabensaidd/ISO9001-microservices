import { Component } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import {NavigationEnd, Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-front',
  standalone: true,
  imports: [CommonModule, RouterModule], // Added RouterModule for routing
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.scss']
})
export class HeaderFrontComponent {

  isMobileNavOpen = false;

  constructor(private router: Router,private keycloakService: KeycloakService) {
    // Handle fragment navigation for smooth scrolling
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const fragment = this.router.url.split('#')[1];
        if (fragment) {
          setTimeout(() => {
            const element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100); // Delay to ensure DOM is rendered
        }
      }
    });
  }

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
    const navmenu = document.querySelector('.navmenu');
    if (navmenu) {
      navmenu.classList.toggle('active');
    }
  }


  login() {
    this.keycloakService.login({
      redirectUri: window.location.origin + '/dashboard/analytics' // Redirection after login
    });
  }
}

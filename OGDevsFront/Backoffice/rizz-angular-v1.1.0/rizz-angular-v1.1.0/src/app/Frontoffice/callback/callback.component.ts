import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/service/auth.service';

@Component({
  selector: 'app-callback',
  template: `<p>Redirection en cours...</p>`,
  standalone: true,
})
export class CallbackComponent implements OnInit {
  constructor(private router: Router, private authService: AuthenticationService) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      // Si l'utilisateur est déjà authentifié, redirection vers la page dashboard
      this.router.navigate(['/dashboard']);
    } else {
      // Remplace ces valeurs par les credentials de l'utilisateur si nécessaire
      const username = 'test_user';
      const password = 'test_password';

      this.authService.login(username, password).subscribe({
        next: () => {
          // Vérifiez si l'utilisateur est maintenant authentifié
          if (this.authService.isAuthenticated()) {
            // Redirection vers la route dashboard
            this.router.navigate(['/dashboard']); // Redirection vers la page du tableau de bord
          } else {
            this.redirectToLogin();
          }
        },
        error: () => this.redirectToLogin(), // Gestion d'erreur pour redirection vers la page de login
      });
    }
  }

  private redirectToLogin(): void {
    window.location.href = 'http://localhost:8080/auth/realms/test/protocol/openid-connect/auth?client_id=my-client&response_type=code&scope=openid&redirect_uri=http://localhost:4200/callback';
  }
}

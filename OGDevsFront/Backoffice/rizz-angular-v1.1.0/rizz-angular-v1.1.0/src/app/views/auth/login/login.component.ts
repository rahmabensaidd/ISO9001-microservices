import { Component, OnInit, inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  standalone: true,
  styles: ``,
})
export class LoginComponent implements OnInit {
  signInForm!: UntypedFormGroup;
  submitted: boolean = false;

  public fb = inject(UntypedFormBuilder);
  public http = inject(HttpClient); // Ajout de HttpClient

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['user@demo.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]],
    });
  }

  get formValues() {
    return this.signInForm.controls;
  }

  login() {
    this.submitted = true;
    if (this.signInForm.valid) {
      const email = this.formValues['email'].value;
      const password = this.formValues['password'].value;

      // Préparer les données pour l'API Keycloak
      const body = new URLSearchParams();
      body.set('grant_type', 'password');
      body.set('client_id', 'votre-client-id'); // Remplacez par l'ID de votre client Keycloak
      body.set('username', email); // Keycloak utilise "username" au lieu de "email"
      body.set('password', password);

      // Appel à l'API Keycloak
      this.http
        .post(
          'http://localhost:8080/realms/test/protocol/openid-connect/token',
          body.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        )
        .subscribe(
          (response) => {
            console.log('Connexion réussie, token:', response);
            // Redirigez ou traitez le token ici
          },
          (error) => {
            console.error('Erreur de connexion:', error);
            // Affichez un message d'erreur à l'utilisateur si nécessaire
          }
        );
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderFrontComponent } from '@/app/Frontoffice/header-front/header-front.component';
import { FooterFrontComponent } from '@/app/Frontoffice/footer-front/footer-front.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderFrontComponent, FooterFrontComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}

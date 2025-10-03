import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-logo-box',
  imports: [RouterLink],
  template: `
    <div class="brand">
      <a routerLink="/" class="logo">
        <span class="me-6">
          <img
            src="assets/images/cropped-coconsultlogo_flood2__3_.png"
            alt="logo-small"
            class="logo-sm"
          />
        </span>
        <span class="">

        </span>
      </a>
    </div>
  `,
  standalone: true,
  styles: ``
})
export class LogoBoxComponent {}

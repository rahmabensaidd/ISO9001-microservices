import { Component, HostListener, Renderer2, inject } from '@angular/core'
import { TopbarComponent } from '../topbar/topbar.component'
import { RouterModule } from '@angular/router'
import { SidebarComponent } from '../sidebar/sidebar.component'
import { FooterComponent } from '../footer/footer.component'
import { getSidebarsize } from '@/app/store/layout/layout-selector'
import { changesidebarsize } from '@/app/store/layout/layout-action'
import { Store } from '@ngrx/store'

@Component({
  selector: 'app-vertical',
  imports: [TopbarComponent, RouterModule, SidebarComponent, FooterComponent],
  templateUrl: './vertical.component.html',
  standalone: true,
  styles: ``
})
export class VerticalComponent {
  private store = inject(Store)
  private renderer = inject(Renderer2)

    ngOnInit(): void {
      this.onResize()
    }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth >= 310 && window.innerWidth <= 1440) {
      this.store.dispatch(changesidebarsize({ size: 'collapsed' }))
    } else {
      this.store.dispatch(changesidebarsize({ size: 'default' }))
    }
    this.store.select(getSidebarsize).subscribe((size: string) => {
      this.renderer.setAttribute(document.body, 'data-sidenav-size', size)
    })
  }

  onToggleMobileMenu() {
    this.store.select(getSidebarsize).subscribe((size: any) => {
      document.body.setAttribute('data-sidenav-size', size)
    })
    const size = document.body.getAttribute('data-sidenav-size')
    const sidebarOverlay = document.querySelector('.startbar-overlay')
    this.renderer.listen(sidebarOverlay, 'click', () => {
      this.store.dispatch(changesidebarsize({ size: 'collapsed' }))
    })

    if (size == 'default') {
      this.store.dispatch(changesidebarsize({ size: 'collapsed' }))
    } else {
      this.store.dispatch(changesidebarsize({ size: 'default' }))
    }
  }
}

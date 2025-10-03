import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core'

@Directive({
  selector: '[appMagic]',
  standalone: true,
})
export class MagicDirective {
  @Input('appMagic') animationName: string = ''
  animateMeDiv!: HTMLElement

  constructor(private renderer: Renderer2) {}

  @HostListener('click') onClick() {
    this.animateMeDiv = this.renderer.selectRootElement('#animate-me', true)
    this.addAnimationClass()
  }

  private addAnimationClass() {
    this.animateMeDiv?.classList.add('magictime', this.animationName)

    const handleAnimationEnd = () => {
      this.animateMeDiv?.classList.remove('magictime', this.animationName)
      this.animateMeDiv?.removeEventListener('animationend', handleAnimationEnd)
    }

    this.animateMeDiv?.addEventListener('animationend', handleAnimationEnd)
  }
}

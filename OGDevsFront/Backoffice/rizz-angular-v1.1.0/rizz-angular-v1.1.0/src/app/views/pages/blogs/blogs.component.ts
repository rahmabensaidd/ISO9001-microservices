import { Component } from '@angular/core'
import { blogData } from './data'
import { CommonModule } from '@angular/common'

@Component({
    selector: 'app-blogs',
    imports: [CommonModule],
    templateUrl: './blogs.component.html',
    styles: ``
})
export class BlogsComponent {
  blogData = blogData
}

import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { ClipboardModule, ClipboardService } from 'ngx-clipboard'

@Component({
    selector: 'app-clipboard',
    imports: [ClipboardModule, FormsModule],
    templateUrl: './clipboard.component.html',
    styles: ``
})
export class ClipboardComponent {
  text: string = 'Welcome to Rizz!'
  text1: string = 'Welcome to Rizz!'
  paragraph: string = `Contrary to popular belief, Lorem Ipsum is not simply random text. 
                  It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, 
                  a Latin professor at Hampden-Sydney College in Virginia, looked `

  constructor(private clipboardService: ClipboardService) {}

  cutText(inputElement: HTMLInputElement | HTMLTextAreaElement): void {
    this.clipboardService.copyFromContent(inputElement.value)
    inputElement.value = ''
  }

  // cutTextarea(textareaElement: HTMLTextAreaElement): void {
  //   this.clipboardService.copyFromContent(textareaElement.value);
  //   textareaElement.value = '';
  // }
}

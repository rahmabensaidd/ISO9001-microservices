import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { QuillEditorComponent } from 'ngx-quill'
import Editor from 'quill/core/editor'

@Component({
    selector: 'app-editors',
    imports: [QuillEditorComponent, FormsModule],
    templateUrl: './editors.component.html',
    styles: ``
})
export class EditorsComponent {
  editor!: Editor

  content: string = ` <div id="editor">
                    <p>Hello World!</p>
                    <p>Some initial <strong>bold</strong> text</p>
                    <p><br /></p>
                </div>`
  public model = {
    editorData: this.content,
  }

  editorConfig = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  }

  editorConfigBubble = {
    toolbar: [
      ['bold', 'italic', 'link', 'blockquote'],
      [{ header: 1 }, { header: 2 }],
    ],
  }
}

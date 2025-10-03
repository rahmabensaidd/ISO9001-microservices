import { UppyService } from '@/app/core/service/uppy.service'
import { Component, OnInit } from '@angular/core'
import Uppy from '@uppy/core'
@Component({
    selector: 'app-uploads',
    imports: [],
    templateUrl: './uploads.component.html',
    styles: ``
})
export class UploadsComponent implements OnInit {
  private uppyInstance!: Uppy
  imageUrl: string | ArrayBuffer | null = null

  private uuid: string = 'unique-id'

  constructor(private uppyService: UppyService) {}

  ngOnInit(): void {
    const pluginConfig: [string, any][] = [
      [
        'Dashboard',
        {
          inline: true,
          target: '#drag-drop-area',
        },
      ],
      ['Tus', { endpoint: 'https://tusd.tusdemo.net/files/' }],
    ]

    this.uppyInstance = this.uppyService.configure(pluginConfig, this.uuid)
  }

  ngOnDestroy(): void {
    if (this.uppyInstance) {
      this.uppyInstance.close()
    }
  }

  handleChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement
    if (inputElement.files && inputElement.files.length > 0) {
      const uploadedFile = inputElement.files[0]
      this.readFile(uploadedFile)
    }
  }

  private readFile(file: File): void {
    const reader = new FileReader()
    reader.onload = () => {
      // Set the preview image src
      this.imageUrl = reader.result as string
    }

    reader.readAsDataURL(file) // Read file as base64
  }
}

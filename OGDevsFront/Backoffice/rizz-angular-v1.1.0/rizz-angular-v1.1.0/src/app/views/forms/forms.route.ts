import { Route } from '@angular/router'
import { ElementsComponent } from './elements/elements.component'
import { AdvancedComponent } from './advanced/advanced.component'
import { ValidationComponent } from './validation/validation.component'
import { WizardComponent } from './wizard/wizard.component'
import { EditorsComponent } from './editors/editors.component'
import { UploadsComponent } from './uploads/uploads.component'
import { ImgCropComponent } from './img-crop/img-crop.component'

export const FORMS_ROUTES: Route[] = [
  {
    path: 'basic',
    component: ElementsComponent,
    data: { title: 'Basic Elements' },
  },
  {
    path: 'advance',
    component: AdvancedComponent,
    data: { title: 'Advance Element' },
  },
  {
    path: 'validation',
    component: ValidationComponent,
    data: { title: 'Validation' },
  },
  {
    path: 'wizard',
    component: WizardComponent,
    data: { title: 'Wizard' },
  },
  {
    path: 'editors',
    component: EditorsComponent,
    data: { title: 'Editors' },
  },
  {
    path: 'file-uploads',
    component: UploadsComponent,
    data: { title: 'File Upload' },
  },
  {
    path: 'image-crop',
    component: ImgCropComponent,
    data: { title: 'Image Crop' },
  },
]

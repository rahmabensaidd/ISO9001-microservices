import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms'

@Component({
    selector: 'app-validation',
    imports: [FormsModule, ReactiveFormsModule, CommonModule],
    templateUrl: './validation.component.html',
    styles: ``
})
export class ValidationComponent {
  validationform!: UntypedFormGroup
  tooltipvalidationform!: UntypedFormGroup
  customValidationForm!: UntypedFormGroup
  supportedForm!: UntypedFormGroup
  submit!: boolean
  formsubmit!: boolean
  cuSubmit!: boolean

  public formBuilder = inject(UntypedFormBuilder)

  ngOnInit(): void {
    this.validationform = this.formBuilder.group({
      firstName: [
        'Mark',
        [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
      ],
      lastName: [
        'Otto',
        [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
      ],
      username: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    })

    this.tooltipvalidationform = this.formBuilder.group({
      firstName: [
        'Mark',
        [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
      ],
      lastName: [
        'Otto',
        [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
      ],
      userName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      city: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      state: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      zip: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
    })

    this.customValidationForm = this.formBuilder.group(
      {
        userName: [
          '',
          [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
        ],
        email: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
        password: [
          '',
          [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
        ],
        confirmpwd: [
          '',
          [Validators.required, Validators.pattern('[a-zA-Z0-9]+')],
        ],
      },
      { validators: this.validateAreEqual }
    )
  }

  get customData() {
    return this.customValidationForm.controls
  }
  get form() {
    return this.validationform.controls
  }

  get formData() {
    return this.tooltipvalidationform.controls
  }

  public validateAreEqual(c: AbstractControl): { notSame: boolean } | null {
    return c.value.password === c.value.confirmpwd ? null : { notSame: true }
  }

  customSubmit() {
    this.cuSubmit = true
  }

  validSubmit() {
    this.submit = true
  }

  formSubmit() {
    this.formsubmit = true
  }
}

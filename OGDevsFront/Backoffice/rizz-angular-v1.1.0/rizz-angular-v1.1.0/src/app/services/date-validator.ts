import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateValidator {
  static pastOrToday(control: AbstractControl): ValidationErrors | null {
    const date = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today ? null : { pastOrToday: true };
  }

  static creationBeforeFinish(creationField: string, finishField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const creationDate = formGroup.get(creationField)?.value;
      const finishDate = formGroup.get(finishField)?.value;
      if (creationDate && finishDate && new Date(finishDate) < new Date(creationDate)) {
        return { invalidDateRange: true };
      }
      return null;
    };
  }
}

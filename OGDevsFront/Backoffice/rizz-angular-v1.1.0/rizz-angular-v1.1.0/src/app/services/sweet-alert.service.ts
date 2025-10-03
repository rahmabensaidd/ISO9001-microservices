import { Injectable } from '@angular/core';
import Swal, { SweetAlertResult } from 'sweetalert2';

interface ButtonOption {
  text: string;
  value: string;
}

interface InputField {
  label: string;
  type: string;
  name: string;
  value?: string;
  required?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {
  showError(message: string): void {
    Swal.fire({
      title: 'Erreur !',
      text: message,
      icon: 'error',
      confirmButtonColor: '#5156be'
    });
  }

  showSuccess(message: string): void {
    Swal.fire({
      title: 'Succès !',
      text: message,
      icon: 'success',
      confirmButtonColor: '#5156be'
    });
  }

  showInfo(message: string): void {
    Swal.fire({
      title: 'Info !',
      text: message,
      icon: 'info',
      confirmButtonColor: '#5156be'
    });
  }

  showWarning(message: string): void {
    Swal.fire({
      title: 'Attention !',
      text: message,
      icon: 'warning',
      confirmButtonColor: '#5156be'
    });
  }

  async showConfirm(title: string, text: string, buttons?: ButtonOption[]): Promise<SweetAlertResult> {
    if (buttons && buttons.length > 0) {
      return Swal.fire({
        title,
        text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: buttons[0].text,
        cancelButtonText: 'Annuler',
        showDenyButton: buttons.length > 1,
        denyButtonText: buttons[1]?.text,
        confirmButtonColor: '#5156be',
        cancelButtonColor: '#dc3545',
        preConfirm: () => buttons[0].value,
        preDeny: () => buttons[1]?.value,
      });
    }
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non',
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#dc3545',
    });
  }

  async showInputForm(title: string, text: string, fields: InputField[]): Promise<SweetAlertResult> {
    return Swal.fire({
      title,
      text,
      html: fields
        .map(
          (field) =>
            `<label>${field.label}${field.required ? ' *' : ''}</label>` +
            (field.type === 'textarea'
              ? `<textarea class="swal2-textarea" id="${field.name}" placeholder="${field.label}">${field.value || ''}</textarea>`
              : `<input type="${field.type}" class="swal2-input" id="${field.name}" placeholder="${field.label}" value="${field.value || ''}" ${field.required ? 'required' : ''}>`)
        )
        .join(''),
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Soumettre',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#5156be',
      cancelButtonColor: '#dc3545',
      preConfirm: () => {
        const result: any = {};
        for (const field of fields) {
          const element = document.getElementById(field.name) as HTMLInputElement | HTMLTextAreaElement;
          result[field.name] = element.value;
          if (field.required && !element.value) {
            Swal.showValidationMessage(`${field.label} est requis`);
            return false;
          }
        }
        return result;
      },
    });
  }
}

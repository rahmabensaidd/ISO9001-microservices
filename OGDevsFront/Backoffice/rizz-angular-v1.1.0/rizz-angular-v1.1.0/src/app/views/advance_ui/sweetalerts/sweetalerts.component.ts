import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sweetalerts',

  templateUrl: './sweetalerts.component.html',
  standalone: true,
  styleUrls: ['./sweetalerts.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SweetalertsComponent {
  showAlert(type: string): void {
    switch (type) {
      case 'basicMessage':
        Swal.fire('Any fool can use a computer');
        break;

      case 'titleText':
        Swal.fire({
          title: 'The Internet?',
          text: 'That thing is still around?',
          icon: 'question'
        });
        break;

      case 'errorType':
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
          footer: '<a href="">Why do I have this issue?</a>'
        });
        break;

      case 'customHtml':
        Swal.fire({
          title: '<strong>HTML <u>example</u></strong>',
          icon: 'info',
          html: 'You can use <b>bold text</b>, ' +
            '<a href="//sweetalert2.github.io">links</a> ' +
            'and other HTML tags',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
          cancelButtonAriaLabel: 'Thumbs down'
        });
        break;

      case 'threeButtons':
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: 'Save',
          denyButtonText: `Don't save`,
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Saved!', '', 'success');
          } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info');
          }
        });
        break;

      case 'customPosition':
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500
        });
        break;

      case 'customAnimation':
        Swal.fire({
          title: 'Custom animation with Animate.css',
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        break;

      case 'warningConfirm':
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
          }
        });
        break;

      case 'handleDismiss':
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
          cancelButtonText: 'No, cancel!'
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Deleted!', 'Your file has been deleted.', 'success');
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire('Cancelled', 'Your imaginary file is safe :)', 'error');
          }
        });
        break;

      case 'customImage':
        Swal.fire({
          title: 'Sweet!',
          text: 'Modal with a custom image.',
          imageUrl: 'https://unsplash.it/400/200',
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: 'Custom image',
        });
        break;

      case 'customWidth':
        Swal.fire({
          title: 'Custom width, padding, background.',
          width: 600,
          padding: '3em',
          background: '#fff url(/images/trees.png)',
          backdrop: `
            rgba(0,0,123,0.4)
            url("/images/nyan-cat.gif")
            left top
            no-repeat
          `
        });
        break;

      case 'timer':
        Swal.fire({
          title: 'Auto close alert!',
          html: 'I will close in <b></b> milliseconds.',
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading();
            const timer = Swal.getHtmlContainer()?.querySelector('b');
            if (timer) {
              const timerInterval = setInterval(() => {
                timer.textContent = `${Swal.getTimerLeft()}`;
              }, 100);
              Swal.getPopup()?.addEventListener('close', () => clearInterval(timerInterval));
            }
          },
          willClose: () => {
            clearInterval(undefined);
          }
        });
        break;

      case 'rtl':
        Swal.fire({
          title: 'هل تريد الاستمرار؟',
          icon: 'question',
          iconHtml: '؟',
          confirmButtonText: 'نعم',
          cancelButtonText: 'لا',
          showCancelButton: true,
          showCloseButton: true
        });
        break;

      case 'ajaxRequest':
        Swal.fire({
          title: 'Submit your Github username',
          input: 'text',
          inputLabel: 'Your Github username',
          inputValue: '',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) {
              return 'You need to write something!';
            }
            return undefined; // Explicitly return undefined when validation passes
          }
        }).then((result) => {
          if (result.isConfirmed) {
            const username = result.value;
            fetch(`https://api.github.com/users/${username}`)
              .then(response => response.json())
              .then(data => {
                Swal.fire({
                  title: `${data.name}'s avatar`,
                  imageUrl: data.avatar_url
                });
              })
              .catch(error => {
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Something went wrong!',
                  footer: error.message
                });
              });
          }
        });
        break;

      case 'mixin':
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
          }
        });

        Toast.fire({
          icon: 'success',
          title: 'Signed in successfully'
        });
        break;

      case 'declarativeTemplate':
        Swal.fire({
          template: '#my-template'
        });
        break;

      case 'TriggerModalToast':
        Swal.fire({
          template: '#my-template'
        });
        break;

      case 'success':
        Swal.fire({
          title: 'Good job!',
          text: 'You clicked the button!',
          icon: 'success',
          confirmButtonColor: '#5156be'
        });
        break;

      case 'error':
        Swal.fire({
          title: 'Error!',
          text: 'Something went wrong!',
          icon: 'error',
          confirmButtonColor: '#5156be'
        });
        break;

      case 'warning':
        Swal.fire({
          title: 'Warning!',
          text: 'Be careful!',
          icon: 'warning',
          confirmButtonColor: '#5156be'
        });
        break;

      case 'info':
        Swal.fire({
          title: 'Info!',
          text: 'Here is some info!',
          icon: 'info',
          confirmButtonColor: '#5156be'
        });
        break;

      case 'question':
        Swal.fire({
          title: 'Question?',
          text: 'Do you have any questions?',
          icon: 'question',
          confirmButtonColor: '#5156be'
        });
        break;

      default:
        Swal.fire('Default alert');
        break;
    }
  }
}

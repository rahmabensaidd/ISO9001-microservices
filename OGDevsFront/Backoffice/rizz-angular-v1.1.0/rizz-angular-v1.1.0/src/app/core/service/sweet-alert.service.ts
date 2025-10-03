import { Injectable } from '@angular/core'
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root',
})
export class SweetAlertService {
  executeExample(sub: string) {
    switch (sub) {
      case 'basicMessage':
        Swal.fire('Any fool can use a computer')
        break

      case 'titleText':
        Swal.fire('The Internet?', 'That thing is still around?', 'question')
        break

      case 'errorType':
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
          footer: '<a href>Why do I have this issue?</a>',
        })
        break

      case 'customHtml':
        Swal.fire({
          title: '<strong>HTML <u>example</u></strong>',
          icon: 'info',
          html:
            'You can use <b>bold text</b>, ' +
            '<a href="//sweetalert2.github.io">links</a> ' +
            'and other HTML tags',
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: '<i class="fa fa-thumbs-up"></i> Great!',
          confirmButtonAriaLabel: 'Thumbs up, great!',
          cancelButtonText: '<i class="fa fa-thumbs-down"></i>',
          cancelButtonAriaLabel: 'Thumbs down',
        })
        break

      case 'threeButtons':
        Swal.fire({
          title: 'Do you want to save the changes?',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: `Save`,
          denyButtonText: `Don't save`,
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Saved!', '', 'success')
          } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info')
          }
        })
        break

      case 'customPosition':
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Your work has been saved',
          showConfirmButton: false,
          timer: 1500,
        })
        break

      case 'customAnimation':
        Swal.fire({
          title: 'Custom animation with Animate.css',
          showClass: {
            popup: 'animate__animated animate__fadeInDown',
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp',
          },
        })
        break

      case 'warningConfirm':
        Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire('Deleted!', 'Your file has been deleted.', 'success')
          }
        })
        break

      case 'handleDismiss':
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-danger me-2',
          },
          buttonsStyling: false,
        })

        swalWithBootstrapButtons
          .fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            reverseButtons: true,
          })
          .then((result) => {
            if (result.isConfirmed) {
              swalWithBootstrapButtons.fire(
                'Deleted!',
                'Your file has been deleted.',
                'success'
              )
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              swalWithBootstrapButtons.fire(
                'Cancelled',
                'Your imaginary file is safe :)',
                'error'
              )
            }
          })
        break

      case 'customImage':
        Swal.fire({
          title: 'Rizz!',
          text: 'Modal with a Brand Logo.',
          imageUrl: 'assets/images/logo-sm.png',
          imageWidth: 80,
          imageHeight: 80,
          imageAlt: 'Custom image',
        })
        break

      case 'customWidth':
        Swal.fire({
          title: 'Custom width, padding, background.',
          width: 600,
          padding: 50,
          background: 'rgba(254,254,254,0.01)  url(assets/images/bg-body.jpg)',
        })
        break

      case 'timer':
        let timerInterval: any
        Swal.fire({
          title: 'Auto close alert!',
          html: 'I will close in <b></b> milliseconds.',
          timer: 2000,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading()
            timerInterval = setInterval(() => {
              const content = Swal.getHtmlContainer()
              if (content) {
                const b: any = content.querySelector('b')
                if (b) {
                  b.textContent = Swal.getTimerLeft()
                }
              }
            }, 100)
            timerInterval = setInterval(() => {
              const content = Swal.getHtmlContainer()
              if (content) {
                const b: any = content.querySelector('b')
                if (b) {
                  b.textContent = Swal.getTimerLeft()
                }
              }
            }, 100)
          },
          willClose: () => {
            clearInterval(timerInterval)
          },
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            console.log('I was closed by the timer')
          }
        })
        break

      case 'rtl':
        Swal.fire({
          title: 'هل تريد الاستمرار؟',
          icon: 'question',
          iconHtml: '؟',
          confirmButtonText: 'نعم',
          cancelButtonText: 'لا',
          showCancelButton: true,
          showCloseButton: true,
        })
        break

      case 'ajaxRequest':
        Swal.fire({
          title: 'Submit your Github username',
          input: 'text',
          inputAttributes: {
            autocapitalize: 'off',
          },
          showCancelButton: true,
          confirmButtonText: 'Look up',
          showLoaderOnConfirm: true,
          preConfirm: (login) => {
            return fetch(`//api.github.com/users/${login}`)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(response.statusText)
                }
                return response.json()
              })
              .catch((error) => {
                Swal.showValidationMessage(`Request failed: ${error}`)
              })
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: `${result.value.login}'s avatar`,
              imageUrl: result.value.avatar_url,
            })
          }
        })
        break

      case 'mixin':
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          },
        })

        Toast.fire({
          icon: 'success',
          title: 'Signed in successfully',
        })
        break

      case 'declarativeTemplate':
        Swal.fire({
          template: '#my-template',
        })
        break

      case 'TriggerModalToast':
        Swal.bindClickHandler()
        Swal.mixin({
          toast: true,
        }).bindClickHandler('data-swal-toast-template')
        break

      case 'success':
        Swal.fire({
          icon: 'success',
          title: 'Your work has been saved',
          timer: 1500,
        })
        break

      case 'error':
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        })
        break

      case 'warning':
        Swal.fire({
          icon: 'warning',
          title: 'Oops...',
          text: 'Icon warning!',
        })
        break

      case 'info':
        Swal.fire({
          icon: 'info',
          title: 'Oops...',
          text: 'Icon Info!',
        })
        break

      case 'question':
        Swal.fire({
          icon: 'question',
          title: 'Oops...',
          text: 'Icon question!',
        })
        break
    }
  }
}

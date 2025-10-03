import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import Selectr from 'mobius1-selectr'
import IMask from 'imask'
import { IMaskModule } from 'angular-imask'
import { HuebeeDirective } from '@/app/core/directive/huebee.directive'
import { DatepickerDirective } from '@/app/core/directive/datepickr.directive'

@Component({
  selector: 'app-advanced',
  imports: [IMaskModule, DatepickerDirective, HuebeeDirective],
  templateUrl: './advanced.component.html',
  standalone: true,
  styles: ``,
})
export class AdvancedComponent implements AfterViewInit {
  count: number = 0
  decreseAmt = 0
  momentFormat = 'YYYY/MM/DD HH:mm'
  momentValue: string | undefined
  startOptions: any = {}
  endOptions: any = {}
  @ViewChild('startDateInput', { static: true, read: ElementRef })
  startDateInput!: ElementRef
  @ViewChild('endDateInput', { static: true, read: ElementRef })
  endDateInput!: ElementRef
  @ViewChild('startPhoneMaskInput', { static: true })
  startPhoneMaskInput!: ElementRef<HTMLInputElement>
  @ViewChild('selectr') selectrElement!: ElementRef
  @ViewChild('selectr2') selectDefaultElement!: ElementRef
  @ViewChild('selectr3') selectToggleElement!: ElementRef

  public maskOption: any = {
    mask: '+{7}(000)000-00-00',
  }

  dateMaskOptions = {
    mask: Date,
    lazy: false,
    overwrite: true,
    autofix: true,
    blocks: {
      d: {
        mask: IMask.MaskedRange,
        placeholderChar: 'd',
        from: 1,
        to: 31,
        maxLength: 2,
      },
      m: {
        mask: IMask.MaskedRange,
        placeholderChar: 'm',
        from: 1,
        to: 12,
        maxLength: 2,
      },
      Y: {
        mask: IMask.MaskedRange,
        placeholderChar: 'y',
        from: 1900,
        to: 2999,
        maxLength: 4,
      },
    },
  }

  regExpMaskOptions: any = {
    mask: /^[1-6]\d{0,5}$/,
  }
  mask: any = {
    mask: '+{7}(000)000-00-00',
  }

  maskOptions = {
    mask: /^\w+$/,
    prepare: (str: string) => {
      return str.toUpperCase()
    },
    commit: (value: string, masked: any) => {
      masked._value = value.toLowerCase()
    },
  }

  dateOption = {
    mask: Date,
    pattern: 'YYYY/MM/DD HH:mm',
    overwrite: true,
    autofix: true,
    lazy: false,
    min: new Date(1970, 0, 1),
    max: new Date(2030, 0, 1),
    blocks: {
      YYYY: {
        mask: IMask.MaskedRange,
        from: 1970,
        to: 2030,
      },
      MM: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 12,
      },
      DD: {
        mask: IMask.MaskedRange,
        from: 1,
        to: 31,
      },
      HH: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 23,
      },
      mm: {
        mask: IMask.MaskedRange,
        from: 0,
        to: 59,
      },
    },
  }

  ngAfterViewInit(): void {
    const element = this.selectrElement.nativeElement
    const selectr = new Selectr(element, {})
    const element2 = this.selectDefaultElement.nativeElement
    const selectr2 = new Selectr(element2, {
      multiple: true,
    })
    const element3 = this.selectToggleElement.nativeElement
    const selectr3 = new Selectr(element3, {
      taggable: true,
      tagSeperators: [',', '|'],
    })

    const startDatepicker = (this.startDateInput.nativeElement as any)
      .datepicker
    const endDatepicker = (this.endDateInput.nativeElement as any).datepicker

    this.startDateInput.nativeElement.addEventListener(
      'changeDate',
      (event: any) => {
        const startDate = event.date
        endDatepicker.setMinDate(startDate)
      }
    )

    this.endDateInput.nativeElement.addEventListener(
      'changeDate',
      (event: any) => {
        const endDate = event.date
        startDatepicker.setMaxDate(endDate)
      }
    )

    const formElement = document.getElementById(
      'moment-mask'
    ) as HTMLInputElement | null
    if (formElement) {
      const startPhoneMask = IMask(formElement, this.dateOption).on(
        'accept',
        () => {
          this.onAcceptDate(startPhoneMask)
        }
      )
    }

    const inputElement = document.getElementById(
      'start-phone-mask'
    ) as HTMLInputElement | null

    if (inputElement) {
      this.startPhoneMask = IMask(inputElement, this.maskOption)
        .on('accept', () => {
          this.onAccept()
        })
        .on('complete', () => {
          this.onComplete()
        })
    }
  }

  incrementCounter() {
    this.count++
  }

  decrementCounter() {
    if (this.decreseAmt == 0 && this.count > 0) {
      this.count--
    }
  }

  startPhoneMask: any

  onAccept() {
    if (this.startPhoneMask) {
      const completeElement = document.getElementById('start-phone-complete')
      const unmaskedElement = document.getElementById('start-phone-unmasked')

      if (completeElement && unmaskedElement) {
        completeElement.style.display = 'none'
        unmaskedElement.innerHTML = this.startPhoneMask.unmaskedValue
      }
    } else {
      console.error('Mask is not initialized')
    }
  }

  onComplete() {
    if (this.startPhoneMask) {
      const completeElement = document.getElementById('start-phone-complete')

      if (completeElement) {
        completeElement.style.display = 'inline-block'
      }
    } else {
      console.error('Mask is not initialized')
    }
  }

  onAcceptDate(startPhoneMask: any) {
    const completeElement = document.getElementById('moment-value')

    if (completeElement) {
      completeElement.innerHTML = startPhoneMask.unmaskedValue
    }
  }
}

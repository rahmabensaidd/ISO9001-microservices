import { Component, inject } from '@angular/core'
import { FullCalendarModule } from '@fullcalendar/angular'
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core'
import interactionPlugin, {
  DateClickArg,
  Draggable,
} from '@fullcalendar/interaction'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import bootstrapPlugin from '@fullcalendar/bootstrap'
import listPlugin from '@fullcalendar/list'
import { Store } from '@ngrx/store'
import { getEvents } from '@/app/store/calendar/calendar.selectors'
import {
  addCalendar,
  deleteCalendar,
  fetchCalendar,
  updateCalendar,
} from '@/app/store/calendar/calendar.actions'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { UntypedFormBuilder, type UntypedFormGroup } from '@angular/forms'

export type CalendarEvent = {
  id: string
  title: string
  start: Date | null
  end?: Date | null
  allDay?: boolean
  classNames?: string[]
}

type UpdateEventType = {
  event: CalendarEvent
}

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  standalone: true,
  styles: ``
})
export class CalendarComponent {
  calendarEvents!: EventInput[]

  formData!: UntypedFormGroup
  editEvent: CalendarEvent | null = null
  isEditMode = false
  currentDate!: Date

  private store = inject(Store)
  private modalService = inject(NgbModal)
  private formBuilder = inject(UntypedFormBuilder)

  ngOnInit() {
    // Fetch Calendar Event
    this.store.dispatch(fetchCalendar())
    this.store.select(getEvents).subscribe((data) => {
      this.calendarEvents = data
    })
  }

  calendarOptions: CalendarOptions = {
    plugins: [
      dayGridPlugin,
      listPlugin,
      interactionPlugin,
      timeGridPlugin,
      bootstrapPlugin,
    ],
    headerToolbar: {
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
      center: 'title',
      left: 'prev,next today',
    },
    timeZone: 'UTC',
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    bootstrapFontAwesome: false,
    initialEvents: this.calendarEvents,
    eventReceive: (info) => this.updateEvent(info),
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.openModal.bind(this),
  }

  updateEvent(info: UpdateEventType) {
    var newEvent = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start!,
      allDay: info.event.allDay,
      className: info.event.classNames,
    }
    this.store.dispatch(addCalendar({ events: newEvent }))
  }

  openModal(events: DateClickArg) {
    this.currentDate = events.date
    // this.modalService.open(this.modalShow, { centered: true })
  }

  // Handle Edit Event
  handleEventClick(clickInfo: EventClickArg) {
    this.isEditMode = true
    this.editEvent = clickInfo.event
    this.formData.patchValue({
      title: this.editEvent.title,
      className: this.editEvent.classNames,
    })
    // this.modalService.open(this.modalShow, { centered: true })
  }

  //  Create New Event
  createEvent() {
    this.currentDate = new Date()
    // this.modalService.open(this.modalShow, { centered: true })
  }

  saveEvent() {
    if (this.isEditMode == true) {
      const newEvent = {
        ...this.formData.value,
        id: this.editEvent?.id,
        start: this.editEvent?.start,
        end: this.editEvent?.end ? this.editEvent?.end : this.editEvent?.start,
      }
      this.store.dispatch(updateCalendar({ events: newEvent }))
    } else {
      const newEvent = {
        id: (this.calendarEvents.length + 1).toString(),
        ...this.formData.value,
        start: this.currentDate,
      }
      this.store.dispatch(addCalendar({ events: newEvent }))
    }
    this.formData.reset()
    this.modalService.dismissAll()
    this.isEditMode = false
  }

  // Delete Event
  deleteEvent() {
    this.store.dispatch(
      deleteCalendar({ id: this.editEvent?.id ? this.editEvent?.id : '' })
    )
    // Swal.fire({
    //   position: 'center',
    //   icon: 'success',
    //   title: 'Event has been deleted',
    //   showConfirmButton: false,
    //   timer: 1000,
    // })
    this.modalService.dismissAll()
    this.isEditMode = false
    this.formData.reset()
  }
}

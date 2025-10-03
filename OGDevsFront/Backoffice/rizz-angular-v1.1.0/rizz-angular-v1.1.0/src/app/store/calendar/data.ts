import { EventInput } from '@fullcalendar/core'

const defaultEvents: EventInput[] = [
  {
    id: '1',
    title: 'Business Lunch',
    start: new Date(Date.now() - 158000000),
    end: new Date(Date.now() - 338000000),
    constraint: 'businessHours',
  },
  {
    id: '2',
    title: 'Meeting',
    start: new Date(),
    end: new Date(),
    constraint: 'availableForMeeting',
  },
  {
    id: '3',
    title: 'Conference',
    start: new Date(Date.now() + 168000000),
  },
  {
    id: '4',
    title: 'Repeating Event',
    start: new Date(Date.now() + 338000000),
    end: new Date(Date.now() + 338000000 * 1.2),
  },
  {
    id: '5',
    title: 'holiday',
    start: new Date(Date.now() + 888000000),
    className: 'bg-danger-subtle text-danger',
  },
]

export { defaultEvents }

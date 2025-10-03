import { currentYear } from '@/app/common/constants'

export type NotificationDetailType = {
  date: string
  count: number
  events: EventDetails[]
}

export type EventDetails = {
  title: string
  time: string
  description: string
  avatar: string
  actions: string[]
}

export const notificationDetail: NotificationDetailType[] = [
  {
    date: 'Today',
    count: 2,
    events: [
      {
        title: 'Appointment with Charles Reiter',
        time: '01:30 PM',
        description:
          'Please ensure you have all necessary documents or items required for the appointment',
        avatar: 'assets/images/users/avatar-10.jpg',
        actions: ['View', 'Delete'],
      },
      {
        title: 'New Session booked by Joseph Rust',
        time: '10:37 AM',
        description:
          'Please confirm this appointment and let us know if you have any preferences or special requirements. Looking forward to our session together!',
        avatar: 'assets/images/users/avatar-1.jpg',
        actions: ['View', 'Delete'],
      },
      {
        title: 'Payment Not Added',
        time: '04:10 AM',
        description:
          'This is to inform you that your recent payment has not been successfully processed. Please review your payment method and ensure that sufficient funds are available or that the provided details are accurate.',
        avatar: 'assets/images/users/avatar-9.jpg',
        actions: ['View', 'Delete'],
      },
    ],
  },
  {
    date: 'Yesterday',
    count: 5,
    events: [
      {
        title: 'Password change email sent',
        time: '07:45 PM',
        description:
          'This is to inform you that your password has been successfully changed for your account.',
        avatar: 'assets/images/users/avatar-2.jpg',
        actions: ['View', 'Delete'],
      },
      {
        title: 'Meeting at 07:45 PM',
        time: '02:05 PM',
        description:
          "Meeting Reminder: Just a quick heads-up about your meeting tonight at 07:45 PM. Don't forget to prep any necessary materials and jot down any questions or topics you'd like to discuss.",
        avatar: 'assets/images/users/avatar-3.jpg',
        actions: ['View', 'Delete'],
      },
      {
        title: 'Payment Not Added',
        time: '11:15 AM',
        description:
          'This is to inform you that your recent payment has not been successfully processed. Please review your payment method and ensure that sufficient funds are available or that the provided details are accurate.',
        avatar: 'assets/images/users/avatar-4.jpg',
        actions: ['View', 'Delete'],
      },
      {
        title: 'Payment Not Added',
        time: '09:44 AM',
        description:
          'This is to inform you that your recent payment has not been successfully processed. Please review your payment method and ensure that sufficient funds are available or that the provided details are accurate.',
        avatar: 'assets/images/users/avatar-8.jpg',
        actions: ['View', 'Delete'],
      },
    ],
  },
  {
    date: '01 June ' + currentYear,
    count: 8,
    events: [
      {
        title: 'New system upgrade',
        time: '01:30 PM',
        description:
          'During this time, access may be temporarily limited. We appreciate your patience and understanding as we work to improve your experience. Stay tuned for more details!',
        avatar: 'assets/images/users/avatar-5.jpg',
        actions: ['View', 'Delete'],
      },
      {
        title: 'New Session booked by Joseph Rust',
        time: '08:05 AM',
        description:
          'Please confirm this appointment and let us know if you have any preferences or special requirements. Looking forward to our session together!',
        avatar: 'assets/images/users/avatar-7.jpg',
        actions: ['View', 'Delete'],
      },
    ],
  },
]

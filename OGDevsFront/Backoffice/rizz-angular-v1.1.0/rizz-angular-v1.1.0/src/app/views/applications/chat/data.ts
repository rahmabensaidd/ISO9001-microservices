export type ContactType = {
  name: string
  time: string | Date
  message: string
  status: string
  unread_messages?: number
  image: string
}

export const ContactList: ContactType[] = [
  {
    name: 'Daniel Madsen',
    time: '5 min ago',
    message: 'Typing...',
    status: 'online',
    unread_messages: 3,
    image: 'assets/images/users/avatar-1.jpg',
  },
  {
    name: 'James Andrews',
    time: '30 min ago',
    message: 'Amazing Work!! 🔥',
    status: 'offline',
    unread_messages: 1,
    image: 'assets/images/users/avatar-2.jpg',
  },
  {
    name: 'Shauna Jones',
    time: 'Yesterday',
    message: 'Congratulations!',
    status: 'offline',
    image: 'assets/images/users/avatar-3.jpg',
  },
  {
    name: 'Frank Wei',
    time: '1 Feb',
    message: 'Voice message!',
    status: 'online',
    image: 'assets/images/users/avatar-4.jpg',
  },
  {
    name: 'Karen Savage',
    time: '8 Feb',
    message: 'Ok, I like it. 👍',
    status: 'offline',
    image: 'assets/images/users/avatar-5.jpg',
  },
  {
    name: 'Carol Maier',
    time: '12 Feb',
    message: 'Send a pic.!',
    status: 'offline',
    image: 'assets/images/users/avatar-6.jpg',
  },
  {
    name: 'Shauna Jones',
    time: '15 Feb',
    message: 'Congratulations!',
    status: 'offline',
    image: 'assets/images/users/avatar-3.jpg',
  },
  {
    name: 'Frank Wei',
    time: '2 Mar',
    message: 'Voice message!',
    status: 'offline',
    image: 'assets/images/users/avatar-5.jpg',
  },
  {
    name: 'Carol Maier',
    time: '14 Mar',
    message: 'Send a pic.!',
    status: 'offline',
    image: 'assets/images/users/avatar-6.jpg',
  },
]

export const MessageData = [
  {
    id: 1,
    direction: 'left',
    userImage: 'assets/images/users/avatar-1.jpg',
    messages: [
      'Good Morning !',
      'There are many variations of passages of Lorem Ipsum available.',
    ],
    time: 'yesterday',
  },
  {
    id: 2,
    direction: 'right',
    userImage: 'assets/images/users/avatar-3.jpg',
    messages: ['Hi,', 'Can be verified on any platform using docker?'],
    time: '12:35pm',
  },
  {
    id: 3,
    direction: 'left',
    userImage: 'assets/images/users/avatar-1.jpg',
    messages: [
      'Have a nice day !',
      "Command was run with root privileges. I'm sure about that.",
      'ok',
    ],
    time: '11:10pm',
  },
  {
    id: 4,
    direction: 'right',
    userImage: 'assets/images/users/avatar-3.jpg',
    messages: [
      "Thanks for your message David. I thought I'm alone with this issue. Please, 👍 the issue to support it :)",
    ],
    time: '10:10pm',
  },
  {
    id: 5,
    direction: 'left',
    userImage: 'assets/images/users/avatar-1.jpg',
    messages: [
      'Sorry, I just back !',
      'It seems like you are from Mac OS world. There is no /Users/ folder on linux 😄',
    ],
    time: '11:15am',
  },
  {
    id: 6,
    direction: 'right',
    userImage: 'assets/images/users/avatar-3.jpg',
    messages: [
      'Good Morning !',
      'There are many variations of passages of Lorem Ipsum available.',
    ],
    time: '9:02am',
  },
]

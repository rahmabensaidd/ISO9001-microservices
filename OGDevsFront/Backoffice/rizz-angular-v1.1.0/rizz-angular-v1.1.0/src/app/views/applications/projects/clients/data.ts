export type UserType = {
  name: string
  username: string
  avatar: string
  flag: string
}

export type ContactType = {
  email: string
  phone: string
}

export type ClientType = {
  theme: string
  user: UserType
  pre_project: string
  description: string
  contact: ContactType
}
export const ClientsData: ClientType[] = [
  {
    theme: 'Mannat Themes',
    user: {
      name: 'Karen Savage',
      username: '@karen',
      avatar: 'assets/images/users/avatar-1.jpg',
      flag: 'assets/images/flags/baha_flag.jpg',
    },
    pre_project: 'Health App',
    description:
      'Explore our blog for in-depth articles, how-to guides, and inspiring stories that showcase the beauty of sustainable living.',
    contact: {
      email: 'example@example.com',
      phone: '+1 123 456 789',
    },
  },
  {
    theme: 'Mannat Themes',
    user: {
      name: 'Carol Maier',
      username: '@carol',
      avatar: 'assets/images/users/avatar-2.jpg',
      flag: 'assets/images/flags/us_flag.jpg',
    },
    pre_project: 'Payment App',
    description:
      'Below are the contact details for our project client, provided for your reference and communication needs',
    contact: {
      email: 'example@example.com',
      phone: '+1 123 456 789',
    },
  },
  {
    theme: 'Mannat Themes',
    user: {
      name: 'Frank Wei',
      username: '@frank',
      avatar: 'assets/images/users/avatar-3.jpg',
      flag: 'assets/images/flags/french_flag.jpg',
    },
    pre_project: 'Gaming App',
    description:
      'Discover the latest trends in eco-friendly living, from zero-waste hacks to renewable energy solutions. Thank you so much.',
    contact: {
      email: 'example@example.com',
      phone: '+1 123 456 789',
    },
  },
  {
    theme: 'Mannat Themes',
    user: {
      name: 'Sandra Lally',
      username: '@sandra',
      avatar: 'assets/images/users/avatar-4.jpg',
      flag: 'assets/images/flags/germany_flag.jpg',
    },
    pre_project: 'AI App',
    description:
      'Welcome to GreenEco Solutions, your go-to destination for sustainable living tips, eco-friendly products.',
    contact: {
      email: 'example@example.com',
      phone: '+1 123 456 789',
    },
  },
  {
    theme: 'Mannat Themes',
    user: {
      name: 'James Andrews',
      username: '@james',
      avatar: 'assets/images/users/avatar-5.jpg',
      flag: 'assets/images/flags/russia_flag.jpg',
    },
    pre_project: 'Video App',
    description:
      'Take action in your community and beyond with our resources for activism and advocacy. Thank you so much',
    contact: {
      email: 'example@example.com',
      phone: '+1 123 456 789',
    },
  },
  {
    theme: 'Mannat Themes',
    user: {
      name: 'Shauna Jones',
      username: '@shauna',
      avatar: 'assets/images/users/avatar-6.jpg',
      flag: 'assets/images/flags/spain_flag.jpg',
    },
    pre_project: 'Audio App',
    description:
      'Below are the contact details for our project client, provided for your reference and communication needs',
    contact: {
      email: 'example@example.com',
      phone: '+1 123 456 789',
    },
  },
]

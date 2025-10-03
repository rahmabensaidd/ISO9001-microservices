import { currentYear } from '@/app/common/constants'

export type ProjectType = {
  status: string
  logo: string
  title: string
  client: string
  tasks: number
  completion_percentage: number
  budget: string
  start_date: string
  deadline: string
  description: string
  team: string[]
}
export const ProjectData: ProjectType[] = [
  {
    status: 'In Progress',
    logo: 'assets/images/logos/lang-logo/meta.png',
    title: 'Meta App',
    client: 'Jack Jackson',
    tasks: 91,
    completion_percentage: 70,
    budget: '33,100',
    start_date: '08 Dec 2023',
    deadline: '28 Feb ' + currentYear,
    description:
      'Start with a catchy and descriptive title that summarizes the project.',
    team: [
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-placeholder.jpg',
    ],
  },
  {
    status: 'In Progress',
    logo: 'assets/images/logos/lang-logo/gitlab.png',
    title: 'Gitlab',
    client: 'Kevin Ewing',
    tasks: 32,
    completion_percentage: 90,
    budget: '10,500',
    start_date: '10 Mar 2023',
    deadline: '20 Sep ' + currentYear,
    description:
      'Encourage readers to take action, such as visiting the project website.',
    team: [
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-5.jpg',
    ],
  },
  {
    status: 'In Progress',
    logo: 'assets/images/logos/lang-logo/chatgpt.png',
    title: 'ChatGPT 5',
    client: 'Bobby Harrison',
    tasks: 68,
    completion_percentage: 75,
    budget: '41,100',
    start_date: '03 Jan 2023',
    deadline: '15 Aug ' + currentYear,
    description:
      'Highlight the main features or functionalities of the project.',
    team: [
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-placeholder.jpg',
      'assets/images/users/avatar-placeholder.jpg',
    ],
  },
  {
    status: 'In Progress',
    logo: 'assets/images/logos/lang-logo/dropbox.png',
    title: 'Dropbox',
    client: 'Anthony Stockton',
    tasks: 130,
    completion_percentage: 95,
    budget: '55,100',
    start_date: '08 Feb 2023',
    deadline: '28 Dec 2023',
    description:
      'If applicable, give credit to any collaborators, contributors, or sources of inspiration for the project.',
    team: [
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-placeholder.jpg',
      'assets/images/users/avatar-2.jpg',
    ],
  },
  {
    status: 'In Progress',
    logo: 'assets/images/logos/lang-logo/slack.png',
    title: 'Slack Chat',
    client: 'Gilbert Jackson',
    tasks: 91,
    completion_percentage: 40,
    budget: '30,580',
    start_date: '02 Jun 2023',
    deadline: '15 Apr ' + currentYear,
    description:
      'Encourage readers to take action, such as visiting the project website, trying out a demo.',
    team: [
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-6.jpg',
    ],
  },
  {
    status: 'In Progress',
    logo: 'assets/images/logos/lang-logo/dribbble.png',
    title: 'Dribbble Shots',
    client: 'Michael Heinz',
    tasks: 62,
    completion_percentage: 50,
    budget: '25,800',
    start_date: '08 Jan 2023',
    deadline: '28 Dec ' + currentYear,
    description:
      'TechSavvy Solutions was founded with a vision to revolutionize the digital landscape.',
    team: [
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-placeholder.jpg',
    ],
  },
]

import { currentYear } from '@/app/common/constants'

export type ClientType = {
  name: string
  role: string
  avatar: string
}

export type TaskType = {
  title: string
  start_date: string
  end_date: string
  task: string
  priority: string
  team: string
  status: string
  description: string
  client: ClientType
  project_type: string
  progress: number
  total_report: number
  assigned_to: string
}

export const TaskDetails: TaskType[] = [
  {
    title: 'Start from to end',
    start_date: '20 Mar ' + currentYear,
    end_date: '30 Nov ' + currentYear,
    task: 'Working API issue',
    priority: 'High',
    team: 'React development team',
    status: 'In progress',
    description:
      'Outline common error scenarios that team members may encounter when using the APIs. Provide guidance on how to handle these errors gracefully and troubleshoot issues effectively. Offer examples of typical API requests and corresponding responses. These examples can help team members understand how to interact with the APIs and interpret the data they receive.',
    client: {
      name: 'Elliott Snyder',
      role: 'Client',
      avatar: 'assets/images/users/avatar-6.jpg',
    },
    project_type: 'Bank data Management',
    progress: 70,
    total_report: 12,
    assigned_to: 'Kylie Bishop',
  },
  {
    title: 'Start from to end',
    start_date: '10 Jan ' + currentYear,
    end_date: '30 Apr ' + currentYear,
    task: 'Add Product page',
    priority: 'Low',
    team: 'Flutter development team',
    status: 'Done',
    description:
      'Outline common error scenarios that team members may encounter when using the APIs. Provide guidance on how to handle these errors gracefully and troubleshoot issues effectively. Offer examples of typical API requests and corresponding responses. These examples can help team members understand how to interact with the APIs and interpret the data they receive.',
    client: {
      name: 'Daniel Baldwin',
      role: 'Client',
      avatar: 'assets/images/users/avatar-1.jpg',
    },
    project_type: 'Ecommerce',
    progress: 85,
    total_report: 15,
    assigned_to: 'Pearl Carlson',
  },
  {
    title: 'Start from to end',
    start_date: '15 Jun ' + currentYear,
    end_date: '15 Aug ' + currentYear,

    task: 'Form submit page',
    priority: 'Medium',
    team: 'Angular development team',
    status: 'Pending',
    description:
      'Outline common error scenarios that team members may encounter when using the APIs. Provide guidance on how to handle these errors gracefully and troubleshoot issues effectively. Offer examples of typical API requests and corresponding responses. These examples can help team members understand how to interact with the APIs and interpret the data they receive.',
    client: {
      name: 'Unity Pugh',
      role: 'Client',
      avatar: 'assets/images/users/avatar-3.jpg',
    },
    project_type: 'AI Chat & Images',
    progress: 30,
    total_report: 8,
    assigned_to: 'Theodore Duran',
  },
]

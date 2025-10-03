const illustration1 = 'assets/images/extra/ill-1.png'
const illustration2 = 'assets/images/extra/ill-2.png'

export type KanbanSectionType = {
  id: string
  title: string
}

export type KanbanTaskType = {
  id: string
  sectionId: string
  priority: string
  title: string
  image?: string
  description?: string
  commentsCount: number
  totalTasks: number
  completedTasks: number
  tags?: string[]
}

export const kanbanSectionsData: KanbanSectionType[] = [
  {
    id: '501',
    title: 'To Do',
  },
  {
    id: '502',
    title: 'In Progress',
  },
  {
    id: '503',
    title: 'Review',
  },
  {
    id: '504',
    title: 'Done',
  },
]
export const kanbanTasksData: KanbanTaskType[] = [
  {
    id: '601',
    sectionId: '501',
    priority: 'Medium',
    title: 'Simple Design',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 3,
    totalTasks: 16,
    completedTasks: 11,
  },
  {
    id: '602',
    sectionId: '501',
    priority: 'Low',
    title: 'UI/UX Design img.',
    image: illustration2,
    commentsCount: 6,
    totalTasks: 2,
    completedTasks: 0,
  },
  {
    id: '603',
    sectionId: '501',
    priority: 'High',
    title: 'Strong Password',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    tags: ['API', 'Form Submit', 'Responsive'],
    commentsCount: 12,
    totalTasks: 4,
    completedTasks: 0,
  },
  {
    id: '604',
    sectionId: '501',
    priority: 'Medium',
    title: 'Multi Color Dashboard',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 45,
    totalTasks: 4,
    completedTasks: 0,
  },
  {
    id: '605',
    sectionId: '502',
    priority: 'High',
    title: 'Nodejs setup',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 34,
    tags: ['API', 'Form Submit'],
    totalTasks: 3,
    completedTasks: 0,
  },
  {
    id: '606',
    sectionId: '502',
    priority: 'Medium',
    title: 'Add Animation Page',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 56,
    totalTasks: 5,
    completedTasks: 0,
  },
  {
    id: '607',
    sectionId: '502',
    priority: 'Medium',
    title: 'QR code issue fix',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 38,
    totalTasks: 15,
    completedTasks: 7,
  },
  {
    id: '608',
    sectionId: '502',
    priority: 'Low',
    title: 'UI/UX Design img.',
    image: illustration2,
    commentsCount: 23,
    totalTasks: 5,
    completedTasks: 0,
  },
  {
    id: '609',
    sectionId: '503',
    priority: 'Low',
    title: 'Figma Layer Setup',
    image: illustration1,
    commentsCount: 53,
    totalTasks: 5,
    completedTasks: 0,
  },
  {
    id: '610',
    sectionId: '503',
    priority: 'High',
    title: 'Components BS 5',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 73,
    tags: ['Form Submit', 'Responsive'],
    totalTasks: 5,
    completedTasks: 0,
  },
  {
    id: '611',
    sectionId: '503',
    priority: 'Medium',
    title: 'Live data in data table',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 67,
    totalTasks: 6,
    completedTasks: 0,
  },
  {
    id: '612',
    sectionId: '503',
    priority: 'High',
    title: 'ReactJs setup',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 64,
    totalTasks: 8,
    completedTasks: 5,
  },
  {
    id: '613',
    sectionId: '504',
    priority: 'Low',
    title: 'Photoshop 7',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 21,
    totalTasks: 3,
    completedTasks: 0,
  },
  {
    id: '614',
    sectionId: '504',
    priority: 'Medium',
    title: 'Mobile Account Setting',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 12,
    totalTasks: 12,
    completedTasks: 8,
  },
  {
    id: '615',
    sectionId: '504',
    priority: 'Low',
    title: 'UI/UX Design img.',
    image: illustration1,
    commentsCount: 6,
    totalTasks: 2,
    completedTasks: 0,
  },
  {
    id: '616',
    sectionId: '504',
    priority: 'High',
    title: 'Mobile Account Setting',
    description:
      'Contrary to popular belief, Lorem Ipsum is not simply random text.',
    commentsCount: 7,
    tags: ['API', 'Responsive'],
    totalTasks: 8,
    completedTasks: 0,
  },
]

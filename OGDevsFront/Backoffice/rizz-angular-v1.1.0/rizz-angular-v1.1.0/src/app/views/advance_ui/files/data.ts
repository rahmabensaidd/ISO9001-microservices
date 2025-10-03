import { currentYear } from '@/app/common/constants'

type FolderType = {
  title: string
  image: string
  files: number
  storage: string
  progress: number
}

type DocumentType = {
  file_name: string
  date: string
  size: string
  avatars?: string[]
}

export const FolderList: FolderType[] = [
  {
    title: 'Google Drive',
    image: 'assets/images/logos/lang-logo/gdrive.png',
    files: 34,
    storage: '500',
    progress: 38,
  },
  {
    title: 'Dropbox',
    image: 'assets/images/logos/lang-logo/dropbox.png',
    files: 68,
    storage: '500',
    progress: 15,
  },
  {
    title: 'Onedrive',
    image: 'assets/images/logos/lang-logo/onedrive.png',
    files: 192,
    storage: '500',
    progress: 48,
  },
  {
    title: 'Server',
    image: 'assets/images/logos/lang-logo/server.png',
    files: 81,
    storage: '500',
    progress: 76,
  },
]

export const DocumentList: DocumentType[] = [
  {
    file_name: 'payment.pdf',
    date: '18 Jul ' + currentYear,
    size: '2.3 MB',
    avatars: [
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-3.jpg',
    ],
  },
  {
    file_name: 'statement.pdf',
    date: '08 Dec ' + currentYear,
    size: '3.7 MB',
    avatars: [
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-10.jpg',
    ],
  },
  {
    file_name: 'idcard.pdf',
    date: '30 Nov ' + currentYear,
    size: '1.5 MB',
    avatars: [
      'assets/images/users/avatar-7.jpg',
      'assets/images/users/avatar-2.jpg',
    ],
  },
  {
    file_name: 'invoice.pdf',
    date: '09 Sep ' + currentYear,
    size: '3.2 MB',
    avatars: [],
  },
  {
    file_name: 'tutorial.pdf',
    date: '14 Aug ' + currentYear,
    size: '12.7 MB',
    avatars: [
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-8.jpg',
    ],
  },
  {
    file_name: 'project.pdf',
    date: '12 Aug ' + currentYear,
    size: '5.2 MB',
    avatars: [
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-6.jpg',
    ],
  },
]

export const ImageList: DocumentType[] = [
  {
    file_name: 'img52315.jpeg',
    date: '18 Jul ' + currentYear,
    size: '2.3 MB',
    avatars: [
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-3.jpg',
    ],
  },
  {
    file_name: 'img63695.jpeg',
    date: '08 Dec ' + currentYear,
    size: '3.7 MB',
    avatars: [
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-10.jpg',
    ],
  },
  {
    file_name: 'img00021.jpeg',
    date: '30 Nov ' + currentYear,
    size: '1.5 MB',
    avatars: [
      'assets/images/users/avatar-7.jpg',
      'assets/images/users/avatar-2.jpg',
    ],
  },
  {
    file_name: 'img36251.jpeg',
    date: '09 Sep ' + currentYear,
    size: '3.2 MB',
    avatars: [],
  },
  {
    file_name: 'img362511.jpeg',
    date: '14 Aug ' + currentYear,
    size: '12.7 MB',
    avatars: [
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-8.jpg',
    ],
  },
  {
    file_name: 'img963852.jpeg',
    date: '12 Aug ' + currentYear,
    size: '5.2 MB',
    avatars: [
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-6.jpg',
    ],
  },
]

export const AudioList: DocumentType[] = [
  {
    file_name: 'audio52315..',
    date: '18 Jul ' + currentYear,
    size: '2.3 MB',
  },
  {
    file_name: 'audio63695..',
    date: '08 Dec ' + currentYear,
    size: '3.7 MB',
  },
  {
    file_name: 'audio00021..',
    date: '30 Nov ' + currentYear,
    size: '1.5 MB',
  },
  {
    file_name: 'audio36251..',
    date: '09 Sep ' + currentYear,
    size: '3.2 MB',
  },
  {
    file_name: 'audio362511..',
    date: '14 Aug ' + currentYear,
    size: '12.7 MB',
  },
  {
    file_name: 'audio963852..',
    date: '12 Aug ' + currentYear,
    size: '5.2 MB',
  },
]

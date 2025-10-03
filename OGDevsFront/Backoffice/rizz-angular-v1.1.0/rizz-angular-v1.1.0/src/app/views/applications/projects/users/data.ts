import { currentYear } from '@/app/common/constants'

export type UserType = {
  name: string
  email: string
  image: string
  id: string
  role: string
  last_active: string
  status: string
}

export const UserData: UserType[] = [
  {
    name: 'Unity Pugh',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-1.jpg',
    id: '#9958',
    role: 'Manager',
    last_active: 'Today, 02:30pm',
    status: 'Active',
  },
  {
    name: 'Scott Holland',
    email: 'exemple@gmail.com',
    image: 'assets/images/users/avatar-1.jpg',
    id: '#3625',
    role: 'Member',
    last_active: 'Yesterday, 10:15pm',
    status: 'Active',
  },
  {
    name: 'Karen Savage',
    email: 'extradummy@gmail.com',
    image: 'assets/images/users/avatar-2.jpg',
    id: '#9514',
    role: 'Admin',
    last_active: 'Today, 02:30pm',
    status: 'Active',
  },
  {
    name: 'Steven Sharp',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-3.jpg',
    id: '#9958',
    role: 'Leader',
    last_active: 'Today, 02:30pm',
    status: 'Inactive',
  },
  {
    name: 'Teresa Himes',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-4.jpg',
    id: '#4545',
    role: 'Sub.Manager',
    last_active: '2 mar' + currentYear + ',07:30pm',
    status: 'Active',
  },
  {
    name: 'Ralph Denton',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-5.jpg',
    id: '#6325',
    role: 'Manager',
    last_active: 'Today, 02:30pm',
    status: 'Inactive',
  },
  {
    name: 'Unity Pugh',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-1.jpg',
    id: '#9958',
    role: 'Manager',
    last_active: 'Today, 02:30pm',
    status: 'Active',
  },
  {
    name: 'Scott Holland',
    email: 'exemple@gmail.com',
    image: 'assets/images/users/avatar-1.jpg',
    id: '#3625',
    role: 'Member',
    last_active: 'Yesterday, 10:15pm',
    status: 'Active',
  },
  {
    name: 'Karen Savage',
    email: 'extradummy@gmail.com',
    image: 'assets/images/users/avatar-2.jpg',
    id: '#9514',
    role: 'Admin',
    last_active: 'Today, 02:30pm',
    status: 'Active',
  },
  {
    name: 'Steven Sharp',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-3.jpg',
    id: '#9958',
    role: 'Leader',
    last_active: 'Today, 02:30pm',
    status: 'Inactive',
  },
  {
    name: 'Teresa Himes',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-4.jpg',
    id: '#4545',
    role: 'Sub.Manager',
    last_active: '2 mar ' + currentYear + ', 07:30pm',
    status: 'Active',
  },
  {
    name: 'Ralph Denton',
    email: 'dummy@gmail.com',
    image: 'assets/images/users/avatar-5.jpg',
    id: '#6325',
    role: 'Manager',
    last_active: 'Today, 02:30pm',
    status: 'Inactive',
  },
  {
    name: 'Karen Savage',
    email: 'extradummy@gmail.com',
    image: 'assets/images/users/avatar-2.jpg',
    id: '#9514',
    role: 'Admin',
    last_active: 'Today, 02:30pm',
    status: 'Active',
  },
]

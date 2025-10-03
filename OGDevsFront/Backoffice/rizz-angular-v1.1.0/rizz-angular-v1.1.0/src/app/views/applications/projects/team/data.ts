export type LeaderType = {
  name: string
  avatar: string
  role: string
}

export type TeamType = {
  team: string
  logo: string
  leader: LeaderType
  percentage: number
  members: string[]
  description: string
}

export const TeamData: TeamType[] = [
  {
    team: 'Nextjs Developer Team',
    logo: 'assets/images/logos/lang-logo/nextjs.png',
    leader: {
      name: 'Carol Maier',
      avatar: 'assets/images/users/avatar-1.jpg',
      role: 'Team Leader',
    },
    percentage: 50,
    members: [
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-6.jpg',
    ],
    description:
      'Paul is an experienced cybersecurity analyst with 10 years of practice.',
  },
  {
    team: 'Reactjs Developer Team',
    logo: 'assets/images/logos/lang-logo/reactjs.png',
    leader: {
      name: 'Sandra Lally',
      avatar: 'assets/images/users/avatar-2.jpg',
      role: 'Team Leader',
    },
    percentage: 80,
    members: [
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-8.jpg',
      'assets/images/users/avatar-10.jpg',
    ],
    description:
      'Angela is a skilled content writer with over 9 years of experience.',
  },
  {
    team: 'Sveltejs Developer Team',
    logo: 'assets/images/logos/lang-logo/svelte.png',
    leader: {
      name: 'Scott Holland',
      avatar: 'assets/images/users/avatar-3.jpg',
      role: 'Team Leader',
    },
    percentage: 45,
    members: [
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-9.jpg',
      'assets/images/users/avatar-4.jpg',
    ],
    description:
      'Scott is a seasoned professional with more than 12 years of experience in software engineering.',
  },
  {
    team: 'Vuejs Developer Team',
    logo: 'assets/images/logos/lang-logo/vue.png',
    leader: {
      name: 'Gordon Aiello',
      avatar: 'assets/images/users/avatar-8.jpg',
      role: 'Team Leader',
    },
    percentage: 90,
    members: [
      'assets/images/users/avatar-10.jpg',
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-9.jpg',
    ],
    description:
      'Jane has over 10 years of experience in software development.',
  },
  {
    team: 'Symfony Developer Team',
    logo: 'assets/images/logos/lang-logo/symfony.png',
    leader: {
      name: 'Angela McGary',
      avatar: 'assets/images/users/avatar-7.jpg',
      role: 'Team Leader',
    },
    percentage: 25,
    members: [
      'assets/images/users/avatar-9.jpg',
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-1.jpg',
      'assets/images/users/avatar-6.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-2.jpg',
      'assets/images/users/avatar-2.jpg',
    ],
    description:
      'Angela possesses more than a decade of expertise in software engineering.',
  },
  {
    team: 'Nodejs Developer Team',
    logo: 'assets/images/logos/lang-logo/nodejs.png',
    leader: {
      name: 'Mike Gillam',
      avatar: 'assets/images/users/avatar-10.jpg',
      role: 'Team Leader',
    },
    percentage: 65,
    members: [
      'assets/images/users/avatar-5.jpg',
      'assets/images/users/avatar-10.jpg',
      'assets/images/users/avatar-4.jpg',
      'assets/images/users/avatar-9.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-3.jpg',
      'assets/images/users/avatar-3.jpg',
    ],
    description:
      'Mike has over ten years of experience in software development.',
  },
]

type UserType = {
  name: string
  avatar: string
}

export type CustomerType = {
  checkbox_id: string
  customer: UserType
  email: string
  status: string
  order: number
  spent: number
}
export const CustomerData: CustomerType[] = [
  {
    checkbox_id: 'customCheck1',
    customer: {
      name: 'Andy Timmons',
      avatar: 'assets/images/users/avatar-2.jpg',
    },
    email: 'dummy@dummy.com',
    status: 'VIP',
    order: 75,
    spent: 280,
  },
  {
    checkbox_id: 'customCheck2',
    customer: {
      name: 'Jeff Beck',
      avatar: 'assets/images/users/avatar-3.jpg',
    },
    email: 'fake@dummy.com',
    status: 'Loyal',
    order: 65,
    spent: 150,
  },
  {
    checkbox_id: 'customCheck3',
    customer: {
      name: 'Vince Nelson',
      avatar: 'assets/images/users/avatar-4.jpg',
    },
    email: 'exemple@dummy.com',
    status: 'Referral',
    order: 32,
    spent: 39,
  },
  {
    checkbox_id: 'customCheck4',
    customer: {
      name: 'David Gilmour',
      avatar: 'assets/images/users/avatar-5.jpg',
    },
    email: 'only@dummy.com',
    status: 'Inactive',
    order: 40,
    spent: 170,
  },
  {
    checkbox_id: 'customCheck5',
    customer: {
      name: 'Dianna Smiley',
      avatar: 'assets/images/users/avatar-6.jpg',
    },
    email: 'dummy@exemple.com',
    status: 'Re-Order',
    order: 80,
    spent: 220,
  },
  {
    checkbox_id: 'customCheck6',
    customer: {
      name: 'Adolfo Hess',
      avatar: 'assets/images/users/avatar-7.jpg',
    },
    email: 'dummy2dummay@dummy.com',
    status: 'New',
    order: 45,
    spent: 120,
  },
  {
    checkbox_id: 'customCheck7',
    customer: {
      name: 'James Ahern',
      avatar: 'assets/images/users/avatar-8.jpg',
    },
    email: 'dummy10@dummy.com',
    status: 'Repeat',
    order: 88,
    spent: 580,
  },
  {
    checkbox_id: 'customCheck8',
    customer: {
      name: 'Simon Young',
      avatar: 'assets/images/users/avatar-9.jpg',
    },
    email: 'totaldummy@dummy.com',
    status: 'VIP',
    order: 124,
    spent: 380,
  },
  {
    checkbox_id: 'customCheck9',
    customer: {
      name: 'Robert Lewis',
      avatar: 'assets/images/users/avatar-10.jpg',
    },
    email: 'Exemple@dummy.com',
    status: 'Inactive',
    order: 84,
    spent: 254,
  },
  {
    checkbox_id: 'customCheck10',
    customer: {
      name: 'Erik Brim',
      avatar: 'assets/images/users/avatar-1.jpg',
    },
    email: 'onlyfake@dummy.com',
    status: 'Potential',
    order: 62,
    spent: 225,
  },
  {
    checkbox_id: 'customCheck11',
    customer: {
      name: 'Kevin Powers',
      avatar: 'assets/images/users/avatar-5.jpg',
    },
    email: 'exemple@exe.com',
    status: 'Repeat',
    order: 54,
    spent: 345,
  },
  {
    checkbox_id: 'customCheck12',
    customer: {
      name: 'Wendy Keen',
      avatar: 'assets/images/users/avatar-3.jpg',
    },
    email: 'Exemple@dummy.com',
    status: 'New',
    order: 32,
    spent: 39,
  },
  {
    checkbox_id: 'customCheck13',
    customer: {
      name: 'Wendy Keen',
      avatar: 'assets/images/users/avatar-1.jpg',
    },
    email: 'Exemple@dummy.com',
    status: 'New',
    order: 32,
    spent: 39,
  },
]

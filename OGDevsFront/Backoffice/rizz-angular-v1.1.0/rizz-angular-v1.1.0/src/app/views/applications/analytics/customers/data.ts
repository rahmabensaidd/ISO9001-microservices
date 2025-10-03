export type CustomerDatatype = {
  title: string
  value: string
}

export type CustomerCardType = {
  platform: string
  clicks: number
  clicks_text: string
  audience: {
    value: number
    percentage: string
    trend: string
  }
  commission: {
    value: number
    percentage: string
    trend: string
  }
  icon: string
  icon_background: string
  button_text: string
}

export type CustomerTableType = {
  name: string
  avatar: string
  ext: number
  city: string
  start_date: string
  completion: string
}

export const CustomerData: CustomerDatatype[] = [
  {
    title: 'Total Customers',
    value: '38,321',
  },
  {
    title: 'New Customers',
    value: '946',
  },
  {
    title: 'Returning Customers',
    value: '70.8%',
  },
  {
    title: 'Bounce Rate',
    value: '1.5%',
  },
]

export const CustomerCard: CustomerCardType[] = [
  {
    platform: 'Twitter',
    clicks: 2215,
    clicks_text: 'Click',
    audience: {
      value: 214,
      percentage: '1.9%',
      trend: 'increase',
    },
    commission: {
      value: 3251,
      percentage: '0.5%',
      trend: 'decrease',
    },
    icon: 'icofont-twitter',
    icon_background: 'bg-blue',
    button_text: 'Report',
  },
  {
    platform: 'Google',
    clicks: 2154,
    clicks_text: 'Click',
    audience: {
      value: 159,
      percentage: '2.5%',
      trend: 'increase',
    },
    commission: {
      value: 1245,
      percentage: '0.7%',
      trend: 'decrease',
    },
    icon: 'icofont-google-plus',
    icon_background: 'bg-danger',
    button_text: 'Report',
  },
  {
    platform: 'Instagram',
    clicks: 3251,
    clicks_text: 'Click',
    audience: {
      value: 124,
      percentage: '1.7%',
      trend: 'increase',
    },
    commission: {
      value: 2514,
      percentage: '0.2%',
      trend: 'decrease',
    },
    icon: 'icofont-instagram',
    icon_background: 'bg-warning',
    button_text: 'Report',
  },
]

export const CustomerTable: CustomerTableType[] = [
  {
    name: 'Unity Pugh',
    avatar: 'assets/images/users/avatar-1.jpg',
    ext: 9958,
    city: 'Curicó',
    start_date: '2005/02/11',
    completion: '37%',
  },
  {
    name: 'Theodore Duran',
    avatar: 'assets/images/users/avatar-2.jpg',
    ext: 8971,
    city: 'Dhanbad',
    start_date: '1999/04/07',
    completion: '97%',
  },
  {
    name: 'Kylie Bishop',
    avatar: 'assets/images/users/avatar-3.jpg',
    ext: 3147,
    city: 'Norman',
    start_date: '2005/09/08',
    completion: '63%',
  },
  {
    name: 'Willow Gilliam',
    avatar: 'assets/images/users/avatar-4.jpg',
    ext: 3497,
    city: 'Amqui',
    start_date: '2009/11/29',
    completion: '30%',
  },
  {
    name: 'Blossom Dickerson',
    avatar: 'assets/images/users/avatar-5.jpg',
    ext: 5018,
    city: 'Kempten',
    start_date: '2006/11/09',
    completion: '17%',
  },
  {
    name: 'Elliott Snyder',
    avatar: 'assets/images/users/avatar-3.jpg',
    ext: 3925,
    city: 'Enines',
    start_date: '2006/08/03',
    completion: '57%',
  },
  {
    name: 'Castor Pugh',
    avatar: 'assets/images/users/avatar-1.jpg',
    ext: 9488,
    city: 'Neath',
    start_date: '2014/12/23',
    completion: '93%',
  },
  {
    name: 'Pearl Carlson',
    avatar: 'assets/images/users/avatar-2.jpg',
    ext: 6231,
    city: 'Cobourg',
    start_date: '2014/08/31',
    completion: '100%',
  },
  {
    name: 'Deirdre Bridges',
    avatar: 'assets/images/users/avatar-3.jpg',
    ext: 1579,
    city: 'Eberswalde-Finow',
    start_date: '2014/08/26',
    completion: '44%',
  },
  {
    name: 'Daniel Baldwin',
    avatar: 'assets/images/users/avatar-4.jpg',
    ext: 6095,
    city: 'Moircy',
    start_date: '2000/01/11',
    completion: '33%',
  },
  {
    name: 'Pearl Carlson',
    avatar: 'assets/images/users/avatar-5.jpg',
    ext: 6231,
    city: 'Cobourg',
    start_date: '2014/08/31',
    completion: '100%',
  },
]

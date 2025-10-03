export type CountryType = {
  country: string
  flag_image: string
  value: string
  percentage: number
}

export type SocialType = {
  source: string
  url: string
  views: number
  uniques: number
}

export const CountryList: CountryType[] = [
  {
    country: 'USA',
    flag_image: 'assets/images/flags/us_flag.jpg',
    value: '35,365',
    percentage: 2.5,
  },
  {
    country: 'Germany',
    flag_image: 'assets/images/flags/germany_flag.jpg',
    value: '24,865',
    percentage: 1.2,
  },
  {
    country: 'Spain',
    flag_image: 'assets/images/flags/spain_flag.jpg',
    value: '18,369',
    percentage: 0.8,
  },
  {
    country: 'Bahamas',
    flag_image: 'assets/images/flags/baha_flag.jpg',
    value: '11,325',
    percentage: 2.5,
  },
]

export const SocialLinks: SocialType[] = [
  {
    source: 'Twitter',
    url: 'htpps:/',
    views: 9.2,
    uniques: 7.9,
  },
  {
    source: 'Facebook',
    url: '.com/dashboard',
    views: 7.7,
    uniques: 6.2,
  },
  {
    source: 'Instagram',
    url: '.com/ecommerce-index',
    views: 6.8,
    uniques: 5.5,
  },
  {
    source: 'LinkedIn',
    url: '.com/apps/projects-overview',
    views: 5,
    uniques: 4.9,
  },
  {
    source: 'WhatsApp',
    url: '.com/blog/crypto/exchange',
    views: 4.3,
    uniques: 3.3,
  },
]

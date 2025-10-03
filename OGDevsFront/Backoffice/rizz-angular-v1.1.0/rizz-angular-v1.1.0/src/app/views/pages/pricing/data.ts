import { currency } from '@/app/common/constants'

export type PricingDataType = {
  plan: string
  price: string
  description?: string
  features: string[]
  icon?: string
}

export const pricingData: PricingDataType[] = [
  {
    plan: 'Basic Plan',
    price: currency + '39.00',
    description:
      'It is a long established fact that a reader will be distracted by the readable.',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
  {
    plan: 'Premium Plan',
    price: 'currency + 49.00',
    description:
      'It is a long established fact that a reader will be distracted by the readable.',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
  {
    plan: 'Plus Plan',
    price: 'currency + 69.00',
    description:
      'It is a long established fact that a reader will be distracted by the readable.',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
  {
    plan: 'Master Plan',
    price: 'currency + 199.00',
    description:
      'It is a long established fact that a reader will be distracted by the readable.',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
]

export const pricingIconData: PricingDataType[] = [
  {
    plan: 'Basic Plan',
    price: 'currency + 39.00',
    icon: 'icofont-bird-wings text-blue',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
  {
    plan: 'Premium Plan',
    price: 'currency + 49.00',
    icon: 'icofont-woman-bird text-pink',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
  {
    plan: 'Plus Plan',
    price: 'currency + 69.00',
    icon: 'icofont-elk text-success',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
  {
    plan: 'Master Plan',
    price: 'currency + 199.00',
    icon: 'icofont-fire-burn text-warning',
    features: [
      '30GB Disk Space',
      '30 Email Accounts',
      '30GB Monthly Bandwidth',
      '06 Subdomains',
      '10 Domains',
    ],
  },
]

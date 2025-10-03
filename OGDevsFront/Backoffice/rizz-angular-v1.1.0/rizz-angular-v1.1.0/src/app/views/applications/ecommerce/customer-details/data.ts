import { currency, currentYear } from '@/app/common/constants'

type StateType = {
  icon: string
  title: string
  prefix?: string
  amount: string
  suffix?: string
  subtitle: string
}

type ProductType = {
  name: string
  details: string
}

export type CustomerOrderType = {
  order_id: string
  product: ProductType
  date: string
  payment_method: string
  status: string
  amount: number
}

export const StateData: StateType[] = [
  {
    icon: 'iconoir-dollar-circle text-info',
    title: 'Total Cost',
    prefix: currency,
    amount: '27,215',
    suffix: 'k',
    subtitle: 'New 365 Days',
  },
  {
    icon: 'iconoir-cart text-blue',
    title: 'Total Order',
    amount: '190',
    subtitle: 'Order 365 Days',
  },
  {
    icon: 'iconoir-thumbs-up text-primary',
    title: 'Completed',
    amount: '165',
    subtitle: 'Comp. Order 365 Days',
  },
  {
    icon: 'iconoir-xmark-circle text-danger',
    title: 'Canceld',
    amount: '25',
    subtitle: 'Canc.Order 365 Days',
  },
]

export const CustomerOrder: CustomerOrderType[] = [
  {
    order_id: '632536',
    product: {
      name: 'Bata Shoes',
      details: 'size-08 (Model' + currentYear + ')',
    },
    date: '15/08/2023',
    payment_method: 'UPI',
    status: 'Completed',
    amount: 390,
  },
  {
    order_id: '365485',
    product: {
      name: 'Morden Chair',
      details: 'Size-Mediam (Model 2021)',
    },
    date: '22/09/2023',
    payment_method: 'Banking',
    status: 'Completed',
    amount: 630,
  },
  {
    order_id: '325415',
    product: {
      name: 'Reebok Shoes',
      details: 'size-08 (Model 2021)',
    },
    date: '31/12/2023',
    payment_method: 'Paypal',
    status: 'Cancel',
    amount: 450,
  },
  {
    order_id: '546987',
    product: {
      name: 'Cosco Vollyboll',
      details: 'size-04 (Model 2021)',
    },
    date: '05/01 +/currentYear',
    payment_method: 'UPI',
    status: 'Completed',
    amount: 880,
  },
  {
    order_id: '951236',
    product: {
      name: 'Royal Purse',
      details: 'Pure Lether 100%',
    },
    date: '20/02 +/currentYear',
    payment_method: 'BTC',
    status: 'Pending',
    amount: 520,
  },
]

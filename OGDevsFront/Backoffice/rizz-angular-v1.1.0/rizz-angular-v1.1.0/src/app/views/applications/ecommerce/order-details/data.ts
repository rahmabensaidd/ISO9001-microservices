import { currency, currentYear } from '@/app/common/constants'

type ProductType = {
  image: string
  name: string
  description: string
}

type OrderListType = {
  product: ProductType
  price: number
  quantity: number
  total: number
}

export const OrderInfo = {
  username: '@donFlo',
  name: 'Don Flowers',
  email: 'DonIFlowers@jourrapide.com',
  payment: currency + '2450 ',
  order_date: '31 Dec 2023',
  delivery_date: '05 Jan ' + currentYear,
  courier: 'FedEx Corporation',
  address: '718 Bingamon Branch Road',
  location: 'Central Valley',
  pincode: 'NY 10917',
}

export const OrderList: OrderListType[] = [
  {
    product: {
      image: 'assets/images/products/03.png',
      name: 'Royal Purse',
      description: 'Pure Leather 100%',
    },
    price: 80,
    quantity: 3,
    total: 240,
  },
  {
    product: {
      image: 'assets/images/products/04.png',
      name: 'Apple Watch',
      description: 'Size-05 (Model 2021)',
    },
    price: 100,
    quantity: 1,
    total: 100,
  },
  {
    product: {
      image: 'assets/images/products/06.png',
      name: 'Cosco Volleyball',
      description: 'size-04 (Model 2021)',
    },
    price: 20,
    quantity: 4,
    total: 80,
  },
  {
    product: {
      image: 'assets/images/products/05.png',
      name: 'Reebok Shoes',
      description: 'size-08 (Model 2021)',
    },
    price: 50,
    quantity: 10,
    total: 500,
  },
  {
    product: {
      image: 'assets/images/products/01.png',
      name: 'Modern Chair',
      description: 'Size-Medium (Model 2021)',
    },
    price: 70,
    quantity: 2,
    total: 140,
  },
]

import { currentYear } from '@/app/common/constants'

export type OrderType = {
  order_id: string
  product_name: string
  product_details: string
  order_date: string
  payment_method: string
  status: string
  amount: number
}

export const OrderData: OrderType[] = [
  {
    order_id: '546987',
    product_name: 'Bata Shoes',
    product_details: 'size-08 (Model' + currentYear + ')',
    order_date: '15/08/2023',
    payment_method: 'UPI',
    status: 'Completed',
    amount: 390,
  },
  {
    order_id: '362514',
    product_name: 'Morden Chair',
    product_details: 'Size-Mediam (Model 2021)',
    order_date: '22/09/2023',
    payment_method: 'Banking',
    status: 'Completed',
    amount: 630,
  },
  {
    order_id: '215487',
    product_name: 'Reebok Shoes',
    product_details: 'size-08 (Model 2021)',
    order_date: '31/12/2023',
    payment_method: 'Paypal',
    status: 'Cancel',
    amount: 450,
  },
  {
    order_id: '326598',
    product_name: 'Cosco Vollyboll',
    product_details: 'size-04 (Model 2021)',
    order_date: '05/01/' + currentYear,
    payment_method: 'UPI',
    status: 'Completed',
    amount: 880,
  },
  {
    order_id: '369852',
    product_name: 'Royal Purse',
    product_details: 'Pure Lether 100%',
    order_date: '20/02/' + currentYear,
    payment_method: 'BTC',
    status: 'Pending',
    amount: 520,
  },
  {
    order_id: '987456',
    product_name: 'Bata Shoes',
    product_details: 'size-08 (Model' + currentYear + ')',
    order_date: '15/08/2023',
    payment_method: 'UPI',
    status: 'Completed',
    amount: 390,
  },
  {
    order_id: '159753',
    product_name: 'Morden Chair',
    product_details: 'Size-Mediam (Model 2021)',
    order_date: '22/09/2023',
    payment_method: 'Banking',
    status: 'Completed',
    amount: 630,
  },
  {
    order_id: '852456',
    product_name: 'Reebok Shoes',
    product_details: 'size-08 (Model 2021)',
    order_date: '31/12/2023',
    payment_method: 'Paypal',
    status: 'Cancel',
    amount: 450,
  },
  {
    order_id: '154863',
    product_name: 'Cosco Vollyboll',
    product_details: 'size-04 (Model 2021)',
    order_date: '05/01/' + currentYear,
    payment_method: 'UPI',
    status: 'Completed',
    amount: 880,
  },
  {
    order_id: '625877',
    product_name: 'Royal Purse',
    product_details: 'Pure Lether 100%',
    order_date: '20/02/' + currentYear,
    payment_method: 'BTC',
    status: 'Pending',
    amount: 520,
  },
]

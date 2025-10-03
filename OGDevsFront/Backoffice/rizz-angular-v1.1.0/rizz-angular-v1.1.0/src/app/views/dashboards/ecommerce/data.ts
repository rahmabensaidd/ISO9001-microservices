export type ProductType = {
  productName: string
  productImage: string
  productID: string
  price: number
  originalPrice: number
  stockQuantity: number
  soldQuantity: number
  stockStatus: string
}

export type SellingType = {
  name: string
  flag: string
  progress: number
  sales: number
}

export type OrderType = {
  name: string
  avatar: string
  id: string
  amount: number
}

export const ProductList: ProductType[] = [
  {
    productName: 'History Book',
    productImage: 'assets/images/products/01.png',
    productID: 'A3652',
    price: 50,
    originalPrice: 70,
    stockQuantity: 450,
    soldQuantity: 550,
    stockStatus: 'In Stock',
  },
  {
    productName: 'Colorful Pots',
    productImage: 'assets/images/products/02.png',
    productID: 'A5002',
    price: 99,
    originalPrice: 150,
    stockQuantity: 750,
    soldQuantity: 0,
    stockStatus: 'Out of Stock',
  },
  {
    productName: 'Pearl Bracelet',
    productImage: 'assets/images/products/04.png',
    productID: 'A6598',
    price: 199,
    originalPrice: 250,
    stockQuantity: 280,
    soldQuantity: 220,
    stockStatus: 'In Stock',
  },
  {
    productName: 'Dancing Man',
    productImage: 'assets/images/products/06.png',
    productID: 'A9547',
    price: 40,
    originalPrice: 49,
    stockQuantity: 500,
    soldQuantity: 1000,
    stockStatus: 'Out of Stock',
  },
  {
    productName: 'Fire Lamp',
    productImage: 'assets/images/products/05.png',
    productID: 'A2047',
    price: 80,
    originalPrice: 59,
    stockQuantity: 800,
    soldQuantity: 2000,
    stockStatus: 'Out of Stock',
  },
]

export const TopSelling: SellingType[] = [
  {
    name: 'USA',
    flag: 'assets/images/flags/us_flag.jpg',
    progress: 85,
    sales: 5860.0,
  },
  {
    name: 'Spain',
    flag: 'assets/images/flags/spain_flag.jpg',
    progress: 78,
    sales: 5422.0,
  },
  {
    name: 'French',
    flag: 'assets/images/flags/french_flag.jpg',
    progress: 71,
    sales: 4587.0,
  },
  {
    name: 'Germany',
    flag: 'assets/images/flags/germany_flag.jpg',
    progress: 65,
    sales: 3655.0,
  },
  {
    name: 'Bahamas',
    flag: 'assets/images/flags/baha_flag.jpg',
    progress: 48,
    sales: 3325.0,
  },
]

export const OrderList: OrderType[] = [
  {
    name: 'Scott Holland',
    avatar: 'assets/images/users/avatar-1.jpg',
    id: '#3652',
    amount: 3325.0,
  },
  {
    name: 'Karen Savage',
    avatar: 'assets/images/users/avatar-2.jpg',
    id: '#4789',
    amount: 2548.0,
  },
  {
    name: 'Steven Sharp',
    avatar: 'assets/images/users/avatar-3.jpg',
    id: '#4521',
    amount: 2985.0,
  },
  {
    name: 'Teresa Himes',
    avatar: 'assets/images/users/avatar-4.jpg',
    id: '#3269',
    amount: 1845.0,
  },
  {
    name: 'Ralph Denton',
    avatar: 'assets/images/users/avatar-5.jpg',
    id: '#4521',
    amount: 1422.0,
  },
]

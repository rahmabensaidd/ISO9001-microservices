import { Route } from '@angular/router'
import { ProductsComponent } from './products/products.component'
import { CustomersComponent } from './customers/customers.component'
import { OrdersComponent } from './orders/orders.component'
import { OrderDetailsComponent } from './order-details/order-details.component'
import { CustomerDetailsComponent } from './customer-details/customer-details.component'
import { RefundsComponent } from './refunds/refunds.component'

export const ECOMMERCE_ROUTES: Route[] = [
  {
    path: 'products',
    component: ProductsComponent,
    data: { title: 'Products' },
  },
  {
    path: 'customers',
    component: CustomersComponent,
    data: { title: 'Customers' },
  },
  {
    path: 'customers/101',
    component: CustomerDetailsComponent,
    data: { title: 'Customer Details' },
  },
  {
    path: 'orders',
    component: OrdersComponent,
    data: { title: 'Orders' },
  },
  {
    path: 'orders/:id',
    component: OrderDetailsComponent,
    data: { title: 'Order Details' },
  },
  {
    path: 'refunds',
    component: RefundsComponent,
    data: { title: 'Refunds' },
  },
]

import { Resolver, OrderItem } from '../types'

const product: Resolver<any, OrderItem> = (orderItem, args, { db }) =>
  db.Product.findById(orderItem.product)

export default {
  product,
}

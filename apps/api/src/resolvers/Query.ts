import {
  OrderByIdArgs,
  OrderDocument,
  PaginationArgs,
  ProductByIdArgs,
  ProductDocument,
  Resolver,
  UserRole,
} from '../types'
import { findDocument, paginateAndSort, buildConditions } from '../utils'

const orders: Resolver<PaginationArgs> = (_, args, { db, authUser }) => {
  const { _id, role } = authUser
  const { Order } = db
  let conditions = buildConditions(args.where)
  conditions =
    role === UserRole.USER ? { ...conditions, user: _id } : conditions
  return paginateAndSort(Order.find(conditions), args)
}

const order: Resolver<OrderByIdArgs> = (_, args, { db, authUser }) => {
  const { _id } = args
  const { _id: userId, role } = authUser
  const where = role === UserRole.USER ? { user: userId, _id } : null

  return findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where,
  })
}

const products: Resolver<PaginationArgs> = (_, args, { db }) => {
  const { Product } = db
  const conditions = buildConditions(args.where)
  return paginateAndSort(Product.find(conditions), args)
}

const product: Resolver<ProductByIdArgs> = async (_, args, { db }) => {
  const { _id } = args
  return findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
  })
}

export default {
  orders,
  order,
  products,
  product,
}

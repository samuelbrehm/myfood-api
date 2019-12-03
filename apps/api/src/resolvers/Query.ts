import {
  OrderByIdArgs,
  OrderDocument,
  PaginationArgs,
  ProductByIdArgs,
  ProductDocument,
  Resolver,
  UserRole,
} from '../types'
import {
  buildConditions,
  findDocument,
  getFields,
  paginateAndSort,
} from '../utils'

const orders: Resolver<PaginationArgs> = (_, args, { db, authUser }, info) => {
  const { _id, role } = authUser
  const { Order } = db
  let conditions = buildConditions(args.where)
  conditions =
    role === UserRole.USER ? { ...conditions, user: _id } : conditions
  const query = Order.find(conditions).select(getFields(info))

  return paginateAndSort(query, args)
}

const order: Resolver<OrderByIdArgs> = (_, args, { db, authUser }, info) => {
  const { _id } = args
  const { _id: userId, role } = authUser
  const where = role === UserRole.USER ? { user: userId, _id } : null

  return findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where,
    select: getFields(info),
  })
}

const products: Resolver<PaginationArgs> = (_, args, { db }, info) => {
  const { Product } = db
  const conditions = buildConditions(args.where)
  const query = Product.find(conditions).select(getFields(info))
  return paginateAndSort(query, args)
}

const product: Resolver<ProductByIdArgs> = async (_, args, { db }, info) => {
  const { _id } = args
  return findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
    select: getFields(info),
  })
}

export default {
  orders,
  order,
  products,
  product,
}

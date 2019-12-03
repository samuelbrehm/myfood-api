import { compare, hash } from 'bcryptjs'
import { Types } from 'mongoose'
import {
  MutationType,
  OrderCreateArgs,
  OrderDeleteArgs,
  OrderDocument,
  OrderUpdateArgs,
  ProductByIdArgs,
  ProductCreateArgs,
  ProductDocument,
  ProductUpdateArgs,
  Resolver,
  UserRole,
  UserSignInArgs,
  UserSignUpArgs,
} from '../types'
import { findDocument, issueToken, findOrderItem, getFields } from '../utils'
import { CustomError } from '../errors'

const createProduct: Resolver<ProductCreateArgs> = (_, args, { db }) => {
  const { Product } = db
  const { data } = args
  const product = new Product(data)
  return product.save()
}

const updateProduct: Resolver<ProductUpdateArgs> = async (
  _,
  args,
  { db },
  info,
) => {
  const { _id, data } = args
  const product = await findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
    select: getFields(info),
  })
  Object.keys(data).forEach(prop => (product[prop] = data[prop]))
  return product.save()
}

const deleteProduct: Resolver<ProductByIdArgs> = async (
  _,
  args,
  { db },
  info,
) => {
  const { _id } = args
  const product = await findDocument<ProductDocument>({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
    select: getFields(info),
  })
  return product.remove()
}

const signin: Resolver<UserSignInArgs> = async (_, args, { db }) => {
  const { User } = db
  const { email, password } = args.data
  const error = new CustomError(
    'Invalid Credentials!',
    'INVALID_CREDENTIALS_ERROR',
  )

  const user = await User.findOne({ email })
  if (!user) {
    throw error
  }

  const isValid = await compare(password, user.password)
  if (!isValid) {
    throw error
  }

  const { _id: sub, role } = user
  const token = issueToken({ sub, role })

  return { token, user }
}

const signup: Resolver<UserSignUpArgs> = async (_, args, { db }) => {
  const { User } = db
  const { data } = args

  const password = await hash(data.password, 10)
  const user = await new User({
    ...data,
    password,
  }).save()

  const { _id: sub, role } = user
  const token = issueToken({ sub, role })

  return { token, user }
}

const createOrder: Resolver<OrderCreateArgs> = async (
  _,
  args,
  { db, authUser, pubsub },
) => {
  const { data } = args
  const { _id, role } = authUser
  const { Order } = db
  const user = role === UserRole.USER ? _id : data.user || _id

  const total =
    (data &&
      data.items &&
      data.items.reduce((sum, item) => sum + item.total, 0)) ||
    0

  const order = await new Order({
    ...data,
    total,
    user,
  }).save()

  pubsub.publish('ORDER_CREATED', {
    mutation: MutationType.CREATED,
    node: order,
  })

  return order
}

const deleteOrder: Resolver<OrderDeleteArgs> = async (
  _,
  args,
  { db, authUser, pubsub },
  info,
) => {
  const { _id } = args
  const { _id: userId, role } = authUser

  const where = role === UserRole.USER ? { _id, user: userId } : null
  const order = await findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where,
    select: getFields(info, { include: ['user'] }),
  })

  await order.remove()

  pubsub.publish('ORDER_DELETED', {
    mutation: MutationType.DELETED,
    node: order,
  })

  return order
}

const updateOrder: Resolver<OrderUpdateArgs> = async (
  _,
  args,
  { db, authUser, pubsub },
  info,
) => {
  const { data, _id } = args
  const { _id: userId, role } = authUser

  const isAdmin = role === UserRole.ADMIN
  const where = !isAdmin ? { _id, user: userId } : null

  const order = await findDocument<OrderDocument>({
    db,
    model: 'Order',
    field: '_id',
    value: _id,
    where,
    select: getFields(info, { include: ['user', 'items', 'status'] }),
  })

  const user = !isAdmin ? userId : data.user || order.user

  const {
    itemsToUpdate = [],
    itemsToDelete = [],
    itemsToAdd = [],
    status,
  } = args.data

  const foundItemsToUpdate = itemsToUpdate.map(orderItem =>
    findOrderItem(order.items, orderItem._id, 'update'),
  )

  const foundItemsToDelete = itemsToDelete.map(orderItemId =>
    findOrderItem(order.items, orderItemId, 'delete'),
  )

  foundItemsToUpdate.forEach((orderItem, index) =>
    orderItem.set(itemsToUpdate[index]),
  )

  foundItemsToDelete.forEach(orderItem => orderItem.remove())

  itemsToAdd.forEach(itemToAdd => {
    const foundItem = order.items.find(item =>
      (item.product as Types.ObjectId).equals(itemToAdd.product),
    )

    if (foundItem) {
      return foundItem.set({
        quantity: foundItem.quantity + itemToAdd.quantity,
        total: foundItem.total + itemToAdd.total,
      })
    }

    order.items.push(itemToAdd)
  })

  const total = order.items.reduce((sum, item) => sum + item.total, 0)

  order.user = user
  order.status = status || order.status
  order.total = total

  await order.save()

  pubsub.publish('ORDER_UPDATED', {
    mutation: MutationType.UPDATED,
    node: order,
  })

  return order
}

export default {
  createProduct,
  updateProduct,
  deleteProduct,
  signin,
  signup,
  createOrder,
  updateOrder,
  deleteOrder,
}

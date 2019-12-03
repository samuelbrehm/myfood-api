import { Types } from 'mongoose'
import { Resolver, Order } from '../types'
import { getFields } from '../utils'

const user: Resolver<any, Order> = (order, args, { loaders }, info) => {
  const { userLoader } = loaders
  return userLoader.load({
    key: order.user as Types.ObjectId,
    select: getFields(info),
  })
}

export default {
  user,
}

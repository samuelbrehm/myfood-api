import { Resolver, ProductDocument, ProductByIdInput } from '../types'
import { DocumentQuery } from 'mongoose'
import { checkExistence } from '../utils'

const products: Resolver<{}> = (
  _,
  args,
  { db },
): DocumentQuery<ProductDocument[], ProductDocument> => {
  return db.Product.find()
}

const product: Resolver<ProductByIdInput> = async (_, args, { db }) => {
  const { Product } = db
  const { _id } = args
  await checkExistence({
    db,
    model: 'Product',
    field: '_id',
    value: _id,
  })
  return Product.findById(_id)
}

export default {
  products,
  product,
}

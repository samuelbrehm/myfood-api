import { Document, Schema } from 'mongoose'

export interface Product {
  _id: Schema.Types.ObjectId
  name: string
  description: string
  price: number
  unit: string
}

export interface ProductDocument extends Product, Document {
  _id: Schema.Types.ObjectId
}

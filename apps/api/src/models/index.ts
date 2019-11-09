import mongoose from 'mongoose'
import { resolve } from 'path'
import { readdirSync } from 'fs'

const { MONGO_URI } = process.env

const connect = (): Promise<typeof mongoose> =>
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

const models = Object.create({})

readdirSync(__dirname)
  .filter(filename => !filename.includes('index'))
  .forEach(filename => {
    const model = require(resolve(__dirname, filename)).default
    const modelName = filename
      .split('.')
      .shift()
      .replace('Model', '')
    models[modelName] = model
  })

export { connect, models }

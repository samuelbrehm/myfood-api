import { ContextParameters } from 'graphql-yoga/dist/types'
import { createLoaders } from '../loaders'
import { models as db } from '../models'
import { Context } from '../types'
import { pubsub } from '.'

const context = (ctx: ContextParameters): Context => {
  const loaders = createLoaders(['Product', 'User'])
  return {
    ...ctx,
    authUser: null,
    db,
    loaders,
    pubsub,
  }
}

export { context }

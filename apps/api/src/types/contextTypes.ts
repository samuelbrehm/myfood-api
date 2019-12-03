import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ContextParameters } from 'graphql-yoga/dist/types'
import { AuthUser, DataLoaders, Models } from '.'

export interface Context extends ContextParameters {
  authUser: AuthUser
  db: Models
  loaders: DataLoaders
  pubsub: RedisPubSub
}

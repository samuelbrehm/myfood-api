import { RedisPubSub } from 'graphql-redis-subscriptions'
import { ContextParameters } from 'graphql-yoga/dist/types'
import { AuthUser, Models } from '.'

export interface Context extends ContextParameters {
  authUser: AuthUser
  db: Models
  pubsub: RedisPubSub
}

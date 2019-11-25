import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'
import { context } from './config'
import { catchErrorsMiddleware } from './middlewares'
import resolvers from './resolvers'
import { AuthDirective } from './directives/AuthDirective'

const typeDefs = resolve(__dirname, 'schema.graphql')

const server = new GraphQLServer({
  resolvers,
  typeDefs,
  context,
  middlewares: [catchErrorsMiddleware],
  schemaDirectives: {
    auth: AuthDirective,
  },
})

export default server

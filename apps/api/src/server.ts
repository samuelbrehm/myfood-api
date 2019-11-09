import { resolve } from 'path'
import { GraphQLServer } from 'graphql-yoga'

const USERS = [
  { id: 1, name: 'Tony Start', email: 'tony@avengers.com' },
  { id: 2, name: 'Peter Parker', email: 'peter@avengers.com' },
]

const typeDefs = resolve(__dirname, 'schema.graphql')
const resolvers = {
  Query: {
    users: (): typeof USERS => USERS,
  },
  Mutation: {
    createUser: (parent, args): typeof USERS => {
      const { data } = args
      const user = {
        ...data,
        id: USERS.length + 1,
      }
      USERS.push(user)
      return user
    },
  },
}

const server = new GraphQLServer({
  resolvers,
  typeDefs,
})

export default server

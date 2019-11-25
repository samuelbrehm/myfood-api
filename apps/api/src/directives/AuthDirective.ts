import { SchemaDirectiveVisitor } from 'graphql-tools'
import { GraphQLField, defaultFieldResolver } from 'graphql'
import { verify } from 'jsonwebtoken'
import { Context, Resolver, TokenPayload } from '../types'
import { CustomError } from '../errors'

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, Context>): void {
    const {
      resolve = defaultFieldResolver,
      subscribe = defaultFieldResolver,
    } = field

    field.resolve = this.createAuthResolver(resolve)
    field.subscribe = this.createAuthResolver(subscribe)
  }

  createAuthResolver(resolver: Resolver<any>): Resolver<any> {
    return (_, args, ctx, info): any => {
      const Authorization = ctx.request
        ? ctx.request.get('Authorization')
        : ctx.connection.context.Authorization ||
          ctx.connection.context.authorization

      if (!Authorization) {
        throw new CustomError('Unauthenticated!', 'UNAUTHENTICATED_ERROR', {
          detail: 'Token not provided',
        })
      }

      try {
        const token = Authorization.replace('Bearer ', '')
        const { sub, role } = verify(
          token,
          process.env.JWT_SECRET,
        ) as TokenPayload

        const authUser = { _id: sub, role }
        ctx = {
          ...ctx,
          authUser,
        }
      } catch (error) {
        throw new CustomError('Invalid token!', 'INVALID_TOKEN_ERROR', error)
      }

      const { role: expectedRole } = this.args
      const { role: userRole } = ctx.authUser

      if (expectedRole && expectedRole !== userRole) {
        throw new CustomError('Unauthorized!', 'UNAUTHORIZED_ERROR', {
          detail: `Required '${expectedRole}' level!`,
        })
      }

      return resolver.apply(this, [_, args, ctx, info])
    }
  }
}

export { AuthDirective }

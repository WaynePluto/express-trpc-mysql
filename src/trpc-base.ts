import { inferAsyncReturnType, initTRPC, Router, TRPCError } from '@trpc/server'
import * as trpcExpress from '@trpc/server/adapters/express'
import { IncomingHttpHeaders } from 'http'
import jwt from 'jsonwebtoken'
import type { Knex } from 'knex'

export const createContext = ({ req, res }: trpcExpress.CreateExpressContextOptions) => {
  const auth = req.headers.authorization
  const tokenPayload: any = auth ? jwt.decode(auth.replace('Bearer ', '')) : null
  return {
    knex: req.context.knex,
    tokenPayload,
  }
}

type Context = inferAsyncReturnType<typeof createContext>

export const trpc = initTRPC.context<Context>().create({})
export const middleware = trpc.middleware
export const router = trpc.router
export const p = trpc.procedure
export const mergeRouters = trpc.mergeRouters

/** trpc操作步骤 */
export type P = typeof p

/** 服务端路由调用 */
export const getServerCaller = <T extends Router<any>, K extends IDocument>(
  router: T,
  knex: <T extends IDocument>(table: string) => Knex.QueryBuilder<T, T[]>,
  tokenPayload: any = null,
) =>
  trpc.createCallerFactory(router)({
    knex,
    tokenPayload,
    headers: {} as IncomingHttpHeaders,
  })

export const authMiddleware = middleware(async opts => {
  const { ctx } = opts

  // 权限不通过
  if (!ctx.tokenPayload.isAuth) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return opts.next({ ctx })
})

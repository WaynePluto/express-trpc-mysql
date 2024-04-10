import * as trpcExpress from '@trpc/server/adapters/express'
import { createContext, trpc } from './trpc-base'

const appRouter = trpc.router({})
export type AppRouter = typeof appRouter

/** trpc express 适配器 */
export const trpcMiddleware = trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext,
  onError(opts) {
    const { error, type, path, input, ctx, req } = opts
    console.error('trpc Error:', error)
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      // send to bug reporting
    }
  },
})

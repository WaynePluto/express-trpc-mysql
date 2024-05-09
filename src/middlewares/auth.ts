import { middleware } from '@/trpc-base'
import { TRPCError } from '@trpc/server'

export const authMiddleware = middleware(async opts => {
  const { ctx } = opts

  // 权限不通过
  if (!ctx.tokenPayload.isAuth) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return opts.next({ ctx })
})

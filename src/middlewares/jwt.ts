import type { RequestHandler } from 'express'
import { expressjwt } from 'express-jwt'

export const jwt: (secret: string) => RequestHandler = secret => {
  return expressjwt({
    secret,
    algorithms: ['HS256'],
  }).unless({ path: [/login/, /^\/api\//, /^\/trpc\//] })
}


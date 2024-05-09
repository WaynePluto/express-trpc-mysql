import type { RequestHandler } from 'express'

export const initContext = (): RequestHandler => {
  return (req, res, next) => {
    req.context = {} as any
    next()
  }
}

import { ErrorRequestHandler } from 'express'

export const error = (): ErrorRequestHandler => {
  return (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
      res.status(401)
        .json({
          'error': {
            'message': '登录过期',
            'code': 401,
            'data': {},
          },
        })
    } else {
      res.status(500)
        .json({
          'error': {
            'message': '内部错误',
            'code': 500,
            'data': {},
          },
        })
    }
    next()
  }
}

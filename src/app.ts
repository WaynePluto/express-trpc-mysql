import cors from 'cors'
import express from 'express'
import { initContext } from './middlewares/context'
import { error } from './middlewares/error'
import { jwt } from './middlewares/jwt'
// import { initKnex } from './middlewares/knex'
import { initMongo } from './middlewares/mongodb'
import { trpcMiddleware } from './trpc-router'

const boot = async () => {
  const { PORT, JWT_SECRET = '', HOST, DATABASE, USER, PASSWORD } = process.env
  const app = express()

  app.use(initContext())

  app.use(cors())

  app.use(jwt(JWT_SECRET))

  // use mongodb
  const mongo = await initMongo()

  app.use(mongo)

  // use mysql
  // app.use(
  //   initKnex({
  //     host: HOST,
  //     database: DATABASE,
  //     user: USER,
  //     password: PASSWORD,
  //   }),
  // )

  app.use('/trpc', trpcMiddleware)

  app.use(error())

  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`)
  })
}

boot()

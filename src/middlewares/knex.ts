import { RequestHandler } from 'express'
import knex, { Knex } from 'knex'

export const configKnex = (params: { host; database; user; password }) => {
  const { host, database, user, password } = params
  const config = {
    client: 'mysql2',
    connection: {
      host,
      database,
      user,
      password,
    },
    pool: { min: 1, max: 3 },
  }

  return knex(config)
}

export const getKnexBuilder = (knexInst: knex.Knex<any, unknown[]>) => {
  // const pool = knexInst.client.pool

  // pool.on('createSuccess', () => {
  //   console.log('create a new connection')
  // })

  // pool.on('acquireSuccess', () => {
  //   console.log('acquire Success a connection from pool')
  // })

  // pool.on('release', () => {
  //   console.log('a connection was release back to pool')
  // })

  // pool.on('destroyRequest', () => {
  //   console.log('connection destroy Request')
  // })

  // pool.on('destroySuccess', () => {
  //   console.log('connection destroy Success')
  // })

  const queryBuilder = (_knex: Knex) => {
    return <T extends IDocument>(table: string) => _knex<T, T[]>(table)
  }
  return queryBuilder(knexInst)
}

export const initKnex = (params: { host; database; user; password }): RequestHandler => {
  const inst = configKnex(params)
  const builder = getKnexBuilder(inst)

  return (req, res, next) => {
    req.context = {
      knexBuilder: builder,
    }
    next()
  }
}

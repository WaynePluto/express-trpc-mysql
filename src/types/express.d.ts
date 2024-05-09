import type { Knex } from 'knex'
import type { Db } from 'mongodb'

declare global {
  interface IDocument {
    [key: string]: any
  }
  namespace Express {
    interface Request {
      context: {
        knex: <T extends IDocument>(table: string) => Knex.QueryBuilder<T, T[]>
        mongodb: Db
      }
    }
  }
}

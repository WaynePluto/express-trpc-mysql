import type { Knex } from 'knex'

declare global {
  interface IDocument {
    [key: string]: any
  }
  namespace Express {
    interface Request {
      context: {
        knexBuilder: <T extends IDocument>(table: string) => Knex.QueryBuilder<T, T[]>
      }
    }
  }
}

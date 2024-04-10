import type { Knex } from 'knex'

export const getQueryBuilder = (knex: Knex) => {
  return <T extends IDocument>(table: string) => knex<T, T[]>(table)
}

export const getFindBuilder = <T extends IDocument>(
  builder: Knex.QueryBuilder<T, T[]>,
  param: IDocument,
  tableName: string,
) => {
  return Object.entries(param).reduce((builder, cur, i) => {
    const [key, val] = cur
    const tableKey = tableName + '.' + key
    if (typeof val === 'number') {
      return i === 0 ? builder.where(tableKey, val) : builder.andWhere(tableKey, val)
    }
    if (typeof val === 'string') {
      return i === 0 ? builder.where(tableKey, 'like', `%${val}%`) : builder.andWhere(tableKey, 'like', `%${val}%`)
    }
    if (Array.isArray(val)) {
      const [start, end] = val
      return i === 0 ? builder.whereBetween(tableKey, [start, end]) : builder.andWhereBetween(tableKey, [start, end])
    }
    return builder
  }, builder)
}

import { z } from 'zod'
import { isTinyInt } from './z'

export interface IBaseTable {
  id: number
  uuid: string
  create_time: Date
  is_delete: number
  delete_time: Date
}

export type TBaseTable = {
  [k in keyof IBaseTable]?: IBaseTable[k]
}

export const BaseValidator = z.object({
  id: z.number(),
  uuid: z.string().length(32),
  create_time: z.date(),
  is_delete: isTinyInt,
  delete_time: z.date(),
})

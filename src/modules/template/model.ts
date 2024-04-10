import { z } from 'zod'

export const tableName = 'template'

export interface IModel {
  name: string
  uuid?: string
  created_time?: Date
  is_deleted?: number
  deleted_time?: Date
}

export const createZod = z.object({
  name: z.string(),
})

import { z } from 'zod'

export const tableName = 'template'

export interface IModel {
  name: string
  uuid?: string
  created_time?: Date
  is_deleted?: number
  deleted_time?: Date
}

export const createDTO = z.object({
  name: z.string(),
})

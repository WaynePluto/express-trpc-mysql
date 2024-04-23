import { TBaseTable } from '@/utils/base-model'
import { z } from 'zod'

export const tableName = 'template'

export interface IModel {
  name: string
}

export type Model = {
  [key in keyof IModel]?: IModel[key]
} & TBaseTable

export const createZod = z.object({
  name: z.string(),
})

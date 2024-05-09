import { z } from 'zod'

export const hasId = z.object({ id: z.number().or(z.string()) })
export const hasIds = z.object({ ids: z.array(z.string()) })
export const hasUUID = z.object({ uuid: z.string() })

export const hasPage = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(50),
})
export const isTinyInt = z.number().int().min(0).max(1)

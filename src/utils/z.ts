import { z } from 'zod'

export const hasID = z.object({ id: z.number() })
export const hasUUID = z.object({ uuid: z.string() })

export const hasPage = z.object({
  page: z.number().min(1),
  pageSize: z.number().min(1).max(50),
})

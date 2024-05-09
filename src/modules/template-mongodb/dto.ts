import { z } from 'zod'

export const createDTO = z.object({
  name: z.string(),
  count: z.number(),
  created_time: z.date(),
  option: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  profile: z
    .object({
      src: z.string(),
      name: z.string(),
    })
    .optional(),
})

import { mergeRouters, p, router } from '@/trpc-base'
import { CommonRouter } from '@/utils/curd'
import { Model, createZod, tableName } from './model'
const OtherRouter = router({})

export const RouterName = mergeRouters(
  CommonRouter<Model>({
    p,
    tableName: tableName,
    createZod: createZod,
    updateZod: createZod.partial(),
    findZod: createZod.partial(),
  }),
  OtherRouter,
)

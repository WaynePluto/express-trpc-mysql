import { mergeRouters, p, router } from '@/trpc-base'
import { CommonRouter } from '@/utils/curd'
import { IModel, createDTO, tableName } from './model'
const OtherRouter = router({})

export const RouterName = mergeRouters(
  CommonRouter<IModel>({
    p,
    tableName: tableName,
    createDTO: createDTO,
    updateDTO: createDTO.partial(),
    findDTO: createDTO.partial(),
  }),
  OtherRouter,
)

import { P, router } from '@/trpc-base'

import { omit } from 'lodash'
import { z } from 'zod'
import { getFindBuilder } from './knex'
import { getUUID } from './uuid'
import { hasPage, hasUUID } from './z'

/** 自定义字符串校验类型 */
type zodStringEffect = z.ZodString | z.ZodEffects<z.ZodString, string, string>
/** 获取U值类型对应的Zod类型 */
type GetValueZodType<U> = U extends string
  ? zodStringEffect
  : U extends number
  ? z.ZodNumber
  : U extends boolean
  ? z.ZodBoolean
  : U extends Date
  ? z.ZodDate
  : z.ZodTypeAny

/** T对象类型获取Zod校验类型 */
type ZodObj<T> = z.ZodObject<
  {
    [k in keyof T]: GetValueZodType<T[k]>
  },
  'strip',
  z.ZodTypeAny,
  T,
  T
>
/** 类型校验对象，属性均为可选，用于做局部修改 */
type ZodPartial<T> = z.ZodObject<
  {
    [k in keyof T]: z.ZodOptional<GetValueZodType<T[k]>>
  },
  'strip',
  z.ZodTypeAny,
  Partial<T>,
  Partial<T>
>

type CommonRouterParams<T extends IDocument> = {
  p: P
  createZod: ZodObj<T>
  updateZod: ZodPartial<T>
  findZod: ZodPartial<T>
  tableName: string
}

export const CommonRouter = <T extends IDocument>({
  p,
  createZod,
  findZod,
  updateZod,
  tableName,
}: CommonRouterParams<T>) =>
  router({
    create: p.input(createZod).mutation(async ({ input, ctx }) => {
      try {
        const { knexBuilder } = ctx
        const qb = () => knexBuilder<T>(tableName)
        const [id] = await qb().insert(input as any)
        const uuid = getUUID(id)
        const data = { uuid } as any
        const successCount = await qb().where('id', id).update(data)
        if (successCount > 0) {
          return uuid
        } else {
          return ''
        }
      } catch (error) {
        console.log('error:', error)
        return ''
      }
    }),
    findByUUId: p.input(hasUUID).mutation(async ({ input, ctx }) => {
      const { knexBuilder } = ctx
      const qb = knexBuilder<T>(tableName)
      const res = await qb.select('*').where('uuid', input.uuid).first()
      return res
    }),
    findList: p.input(findZod.merge(hasPage)).mutation(async ({ input, ctx }) => {
      const { knexBuilder } = ctx
      const { page, pageSize } = input!
      const offset = (page! - 1) * pageSize!
      const findParams = omit(input, ['page', 'pageSize'])
      const findBuilder = () => getFindBuilder(knexBuilder<T>(tableName), { ...findParams, 'is_deleted': 0 }, tableName)

      const countRes = await findBuilder().count({ count: '*' })
      const listRes = await findBuilder().select('*').limit(pageSize!).offset(offset)
      return {
        data: listRes,
        total: countRes[0].count ?? 0,
      }
    }),
    updateByUUId: p.input(updateZod.merge(hasUUID)).mutation(async ({ input, ctx }) => {
      const { knexBuilder } = ctx
      const qb = knexBuilder<T>(tableName)
      const data = omit(input, ['uuid']) as any
      const res = await qb.where('uuid', input!.uuid).update(data)
      return res
    }),

    tagDelete: p.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
      const { knexBuilder } = ctx
      const qb = knexBuilder<T>(tableName)
      const res = await qb.whereIn('uuid', input).update('is_deleted', 1)
      return res
    }),

    delete: p.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
      const { knexBuilder } = ctx
      const qb = knexBuilder<T>(tableName)
      const res = await qb.whereIn('uuid', input).delete()
      return res
    }),
  })

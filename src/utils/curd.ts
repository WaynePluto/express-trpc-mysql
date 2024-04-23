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

export const CommonOperation = {
  create: <T extends IDocument>(p: P, tableName: string, createZod: ZodObj<T>) =>
    p.input(createZod).mutation(async ({ input, ctx }) => {
      try {
        const { knex } = ctx
        const [id] = await knex<T>(tableName).insert(input as any)
        const uuid = getUUID(id)
        const data = { uuid } as any
        const successCount = await knex<T>(tableName).where('id', id).update(data)
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

  findByUUId: <T extends IDocument>(p: P, tableName: string) =>
    p.input(hasUUID).mutation(async ({ input, ctx }) => {
      const { knex } = ctx
      const res = await knex<T>(tableName).select('*').where('uuid', input.uuid).first()
      return res
    }),

  findList: <T extends IDocument>(p: P, tableName: string, findZod: ZodPartial<T>) =>
    p.input(findZod.merge(hasPage)).mutation(async ({ input, ctx }) => {
      const { knex } = ctx
      const { page, pageSize } = input!
      const offset = (page! - 1) * pageSize!
      const findParams = omit(input, ['page', 'pageSize'])
      const findBuilder = () => getFindBuilder(knex<T>(tableName), { ...findParams, 'is_delete': 0 }, tableName)

      const countRes = await findBuilder().count({ count: '*' })
      const listRes = await findBuilder().select('*').limit(pageSize!).offset(offset)
      return {
        data: listRes,
        total: countRes[0].count ?? 0,
      }
    }),

  updateByUUId: <T extends IDocument>(p: P, tableName: string, updateZod: ZodPartial<T>) =>
    p.input(updateZod.merge(hasUUID)).mutation(async ({ input, ctx }) => {
      const { knex } = ctx
      const data = omit(input, ['uuid']) as any
      const res = await knex<T>(tableName).where('uuid', input!.uuid).update(data)
      return res
    }),

  tagDelete: <T extends IDocument>(p: P, tableName: string) =>
    p.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
      const { knex } = ctx
      const res = await knex<T>(tableName).whereIn('uuid', input).update('is_delete', 1)
      return res
    }),

  delete: <T extends IDocument>(p: P, tableName: string) =>
    p.input(z.array(z.string())).mutation(async ({ input, ctx }) => {
      const { knex } = ctx
      const res = await knex<T>(tableName).whereIn('uuid', input).delete()
      return res
    }),
}

export const CommonRouter = <T extends IDocument>({
  p,
  createZod,
  findZod,
  updateZod,
  tableName,
}: CommonRouterParams<T>) =>
  router({
    create: CommonOperation.create(p, tableName, createZod),
    findByUUId: CommonOperation.findByUUId(p, tableName),
    findList: CommonOperation.findList(p, tableName, findZod),
    updateByUUId: CommonOperation.updateByUUId(p, tableName, updateZod),
    tagDelete: CommonOperation.tagDelete(p, tableName),
    delete: CommonOperation.delete(p, tableName),
  })

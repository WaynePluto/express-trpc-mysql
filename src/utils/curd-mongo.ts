import { p, router } from '@/trpc-base'
import { omit } from 'lodash'
import { Collection, Db, Document, ObjectId } from 'mongodb'
import { z } from 'zod'
import { findFilter } from './mongo'
import { hasId, hasIds, hasPage } from './z'

/** 公共步骤 */
type P = typeof p

/** 数据库集合 */
type GetCol<T extends Document> = (db: Db) => Collection<T>

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

/** 集合字段投影 */
export type Projection<T extends Document> = {
  [key in keyof T]?: number
} & { _id: number }

export const create = <T extends Document>(p: P, col: GetCol<T>, zodObj: ZodObj<T>) =>
  p.input(zodObj).mutation(async ({ input, ctx }) => {
    const res = await col(ctx.mongodb).insertOne(input as any)
    return res.insertedId.toString()
  })

export const createMany = <T extends Document>(p: P, col: GetCol<T>, zodObj: ZodObj<T>) =>
  p.input(z.array(zodObj)).mutation(async ({ input, ctx }) => {
    const res = await col(ctx.mongodb).insertMany(input as any)
    return Object.values(res.insertedIds).map(e => e.toString())
  })

export const findById = <T extends Document>(p: P, col: GetCol<T>) =>
  p.input(hasId).query(async ({ input, ctx }) => {
    const { id } = input
    const res = await col(ctx.mongodb).findOne({
      _id: new ObjectId(id) as any,
    })
    return res
  })

/**
 * 列表查询
 * @param p
 * @param col 所在集合
 * @param zodObj dto，其中的字符串类型进行正则匹配，其他类型进行精确匹配
 * @param projection 列表项映射
 * @returns
 */
export const findList = <T extends Document>(p: P, col: GetCol<T>, zodObj: ZodPartial<T>, projection: Projection<T>) =>
  p.input(zodObj.merge(hasPage)).query(async ({ input, ctx }) => {
    const c = col(ctx.mongodb)
    const { page = 1, pageSize = 1 } = input!
    const findParam = omit(input, ['page', 'pageSize'])
    const filterParam = findFilter(findParam)
    const total = await c.countDocuments(filterParam)
    const list = await c
      .find(filterParam, { projection })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray()
    return {
      total,
      list,
    }
  })

export const updateById = <T extends Document>(p: P, col: GetCol<T>, zodObj: ZodPartial<T>) =>
  p.input(zodObj.merge(hasId)).mutation(async ({ input, ctx }) => {
    const res = await col(ctx.mongodb).updateOne(
      { _id: new ObjectId(input!.id) } as any,
      { $set: omit(input, ['id']) } as any,
    )
    return res.modifiedCount
  })

export const deleteDoc = <T extends Document>(p: P, col: GetCol<T>) =>
  p.input(hasIds).mutation(async ({ input, ctx }) => {
    const ids = input.ids.map(id => new ObjectId(id))
    const res = await col(ctx.mongodb).deleteMany({
      _id: { $in: ids } as any,
    })
    return res.deletedCount
  })

export const CommonRouter = <T extends Document>(p: P, col: GetCol<T>, createDTO: ZodObj<T>) =>
  router({
    create: create<T>(p, col, createDTO),
    createMany: createMany<T>(p, col, createDTO),
    findById: findById<T>(p, col),
    findList: findList<T>(p, col, createDTO.partial(), { _id: 1, name: 1 }),
    updateById: updateById<T>(p, col, createDTO.partial()),
    delete: deleteDoc<T>(p, col),
  })

import { authMiddleware } from '@/middlewares/auth'
import { mergeRouters, p, router } from '@/trpc-base'
import { CommonRouter } from '@/utils/curd-mongo'
import { ObjectId } from 'mongodb'
import { z } from 'zod'
import { createDTO } from './dto'
import { TSchema, collection } from './model'

const CustomRouter = router({
  /** 更新子文档属性 */
  updateChildName: p
    .use(authMiddleware)
    .input(
      z.object({
        id: z.string(),
        childName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, childName } = input
      const res = await collection(ctx.mongodb).updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            'profile.name': childName,
          },
        },
      )
      return res.modifiedCount
    }),

  addArrayEl: p
    .input(
      z.object({
        id: z.string(),
        el: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, el } = input
      console.log(`id:${id}`)
      const res = await collection(ctx.mongodb).updateOne(
        {
          _id: new ObjectId(id),
        },
        {
          $push: {
            roles: el,
          },
        },
      )
      return res.modifiedCount
    }),
})

export const TemplateRouter = mergeRouters(CommonRouter<TSchema>(p, collection, createDTO), CustomRouter)

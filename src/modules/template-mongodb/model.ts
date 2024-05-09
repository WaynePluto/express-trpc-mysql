import { Collection, Db } from 'mongodb'

/** 集合名称 */
export const CollectionName = 'temp_template'

/** 子文档 */
export type TChildSchema = {
  src: string
  name: string
}

/** 集合元素类型 */
export type TSchema = {
  name: string
  count: number
  created_time: Date
  option?: boolean
  roles?: string[]
  profile?: TChildSchema
}

/** 集合访问器 */
export const collection = (db: Db): Collection<TSchema> => db.collection(CollectionName)

import { MongoService } from '@/middlewares/mongodb'
import { getServerCallerWithMongodb } from '@/trpc-base'
import { Db } from 'mongodb'
import { CollectionName } from './model'
import { TemplateRouter as router } from './router'

describe(`test collection name: ${CollectionName}`, () => {
  let db: Db
  const mongoService = new MongoService()
  const caller = () => getServerCallerWithMongodb(router, db)
  const authCaller = () => getServerCallerWithMongodb(router, db, { isAuth: true })

  /** 测试的所有id */
  const ids: string[] = []

  beforeAll(async () => {
    db = await mongoService.connect()
  })

  afterAll(() => {
    mongoService.close()
  })

  it('test create', async () => {
    const id = await caller().create({
      name: 'T1',
      count: 1,
      roles: ['123'],
      profile: {
        src: 'http',
        name: 'profile1',
      },
      created_time: new Date(),
    })
    expect(id).toHaveLength(24)
    ids.push(id)

    const insertedIds = await caller().createMany([
      { name: 'T2', count: 1, created_time: new Date() },
      { name: 'T3', count: 2, created_time: new Date() },
      { name: 'T4', count: 3, created_time: new Date() },
    ])

    expect(insertedIds.length).toBe(3)

    ids.splice(ids.length, 0, ...insertedIds)
  })

  it('test find by id', async () => {
    const data = await caller().findById({ id: ids[0] })
    expect(data).toHaveProperty('name')
    expect(typeof data!.name).toBe('string')
  })

  it('test find list', async () => {
    const data = await caller().findList({ page: 1, pageSize: 2, name: '' })

    expect(data.list.length).toBe(2)

    expect(data.total).toBeGreaterThanOrEqual(3)
  })

  it('test update by id', async () => {
    const count = await caller().updateById({ id: ids[0], name: 'updatedName' })
    expect(count).toBeGreaterThan(0)
    // 权限测试
    const updateChildCount = await authCaller().updateChildName({ id: ids[0], childName: 'child profile' })
    expect(updateChildCount).toBe(1)
  })

  it('test add array element', async () => {
    const count = await caller().addArrayEl({ id: ids[1], el: 'write' })
    expect(count).toBe(1)
  })

  it('test delete by ids', async () => {
    const count = await caller().delete({ ids })
    expect(count).toBeGreaterThanOrEqual(0)
  })
})

import { configKnex, getKnex } from '@/middlewares/knex'
import { getServerCallerWithKnex } from '@/trpc-base'
import { tableName } from './model'
import { RouterName } from './router'

describe(`test table:${tableName}`, () => {
  const { PORT, JWT_SECRET = '', HOST, DATABASE, USER, PASSWORD } = process.env

  const knexInst = configKnex({ host: HOST, database: DATABASE, user: USER, password: PASSWORD })
  const builder = getKnex(knexInst)
  const caller = getServerCallerWithKnex(RouterName, builder)

  const ids: string[] = []

  afterAll(() => {
    console.log('====after all')
    knexInst.destroy()
  })

  it('test create', async () => {
    const uuid = await caller.create({ name: '测试' + Date.now() })
    ids.push(uuid)
    expect(uuid).toHaveLength(32)
  })

  it('test find by id', async () => {
    const res = await caller.findByUUId({ uuid: ids[0] })
    expect(res).toHaveProperty('name')
  })

  it('test find list', async () => {
    const { total, data } = await caller.findList({ page: 1, pageSize: 10 })
    expect(total).toBeGreaterThan(0)
    expect(data).toBeDefined()
    expect(data[0]).toHaveProperty('name')
  })

  it('test update by id', async () => {
    const res = await caller.updateByUUId({ uuid: ids[0], name: `修改uuid${ids[0]}` })
    expect(res).toBeGreaterThan(0)
  })

  it('test tag delete by id', async () => {
    const res = await caller.tagDelete(ids)
    expect(res).toBeGreaterThan(0)
  })

  it('test delete by id', async () => {
    const res = await caller.delete(ids)
    expect(res).toBeGreaterThan(0)
  })
})

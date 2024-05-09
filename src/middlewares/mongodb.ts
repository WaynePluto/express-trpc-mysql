import { RequestHandler } from 'express'
import { MongoClient } from 'mongodb'
const { HOST, DATABASE, USER, PASSWORD, DB_PORT } = process.env

export class MongoService {
  private client: MongoClient

  constructor() {
    const url = `mongodb://${USER}:${PASSWORD}@${HOST}:${DB_PORT}?authSource=${DATABASE}`
    const client = new MongoClient(url, {
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
    })

    // client.on('connectionPoolCreated', () => {
    //   console.log('===连接池 已创建==')
    // })

    // client.on('connectionPoolReady', () => {
    //   console.log('===connectionPoolReady==')
    // })

    // client.on('connectionPoolCleared', () => {
    //   console.log('===connectionPoolCleared==')
    // })

    // client.on('connectionCreated', () => {
    //   console.log('====数据库连接 已创建===')
    // })

    // client.on('connectionReady', () => {
    //   console.log('====connectionReady===')
    // })

    // client.on('connectionCheckedIn', () => {
    //   console.log('connectionCheckedIn')
    // })
    // client.on('connectionCheckedOut', () => {
    //   console.log('==connectionCheckedOut')
    // })

    // 查看连接数目
    // db.serverStatus().connections
    process.on('SIGINT', () => {
      console.log('===close mongo connection===')
      client.close()
      process.exit()
    })
    this.client = client
  }

  private connected = false

  async connect() {
    if (!this.connected) {
      this.client = await this.client.connect()
    }
    return this.client.db(DATABASE)
  }

  close() {
    this.client.close()
  }
}

export const initMongo = async (): Promise<RequestHandler> => {
  const mongoService = new MongoService()
  const db = await mongoService.connect()
  return (req, _, next) => {
    // req.context = {
    //   mongodb: db,
    // }
    req.context.mongodb = db
    next()
  }
}

import { Paginated } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'

import { Application } from '../../../declarations'

export type RecordingDataType = RecordingResult

export class Recording<T = RecordingDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: any): Promise<Paginated<T>> {
    const result = await super.find({
      query: {
        userId: params.user.id
      }
    })
    return result as Paginated<T>
  }

  async create(data?: any, params?: any): Promise<T | T[]> {
    return super.create({
      ...data,
      userId: params.user.id
    })
  }
}

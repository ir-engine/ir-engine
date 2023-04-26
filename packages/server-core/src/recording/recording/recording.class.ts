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

  async get(id: string, params?: any): Promise<T> {
    // get resources with associated URLs
    const resources = await this.app.service('recording-resource').Model.findAndCountAll({
      where: {
        recordingId: id
      },
      include: [
        {
          model: this.app.service('static-resource').Model,
          attributes: ['id', 'key']
        }
      ]
    })

    const result = (await super.get(id)) as RecordingDataType

    result.resources = resources.rows.map((resource) => resource.static_resource.key)

    return result as T
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

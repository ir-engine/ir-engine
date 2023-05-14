import { Paginated } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { RecordingResult } from '@etherealengine/common/src/interfaces/Recording'

import { Application } from '../../../declarations'
import { checkScope } from '../../hooks/verify-scope'
import { UserParams } from '../../user/user/user.class'

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

  async find(params?: UserParams): Promise<Paginated<T>> {
    if (params && params.user && params.query) {
      const admin = await checkScope(params.user, this.app, 'admin', 'admin')
      if (admin && params.query.action === 'admin') {
        // show admin page results only if user is admin and query.action explicitly is admin (indicating admin panel)
        params.sequelize = {
          include: [{ model: this.app.service('user').Model, attributes: ['name'], as: 'user' }]
        }
        return super.find({ ...params }) as Promise<Paginated<T>>
      }
    }
    return super.find({
      query: {
        userId: params?.user!.id
      }
    }) as Promise<Paginated<T>>
  }

  async create(data?: any, params?: any): Promise<T | T[]> {
    return super.create({
      ...data,
      userId: params.user.id
    })
  }
}

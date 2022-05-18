import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { AdminScope as AdminScopeInterface } from '@xrengine/common/src/interfaces/AdminScope'

import { Application } from '../../../declarations'

export type AdminScopeDataType = AdminScopeInterface

export class Scope<T = AdminScopeDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const skip = params?.query?.$skip ? params.query.$skip : 0
    const limit = params?.query?.$limit ? params.query.$limit : 10
    const scope = await (this.app.service('scope') as any).Model.findAndCountAll({
      offset: skip,
      limit: limit,
      include: [
        {
          model: (this.app.service('scope-type') as any).Model,
          required: false
        },
        {
          model: (this.app.service('user') as any).Model,
          required: false
        },
        {
          model: (this.app.service('group') as any).Model,
          required: false
        }
      ],
      raw: true,
      nest: true
    })
    return {
      skip: skip,
      limit: limit,
      total: scope.count,
      data: scope.rows
    }
  }
}

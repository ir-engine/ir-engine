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

  async find(params?: Params): Promise<Paginated<T>> {
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

  async create(data): Promise<T | T[]> {
    const isArray = Array.isArray(data)

    const oldScopes = await super.Model.findAll({
      where: {
        userId: isArray ? data[0].userId : data.userId
      }
    })

    if (isArray) {
      let existingData: any = []
      let createData: any = []

      for (const item of data) {
        const existingScope = oldScopes && (oldScopes as any).find((el) => el.type === item.type)
        if (existingScope) {
          existingData.push(existingScope)
        } else {
          createData.push(item)
        }
      }

      if (createData) {
        const createdData: any = await super.create(data)
        return [...existingData, ...createdData]
      }
    }

    const existingScope = (oldScopes as any).find((el) => el.type === data.type)
    if (existingScope) {
      return existingScope
    } else {
      return await super.create(data)
    }
  }
}

import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import _ from 'lodash'
import { Op } from 'sequelize'

import { AvatarInterface } from '@xrengine/common/src/interfaces/AvatarInterface'

import { Application } from '../../../declarations'

export type AvatarDataType = AvatarInterface

/**
 * A class for Static Resource  service
 *
 * @author Vyacheslav Solovjov
 */
export class StaticResource<T = AvatarDataType> extends Service<T> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async create(data, params?: Params): Promise<T> {
    const oldResource = await this.find({
      query: {
        $select: ['id'],
        url: data.url
      }
    })

    if ((oldResource as any).total > 0) {
      return this.Model.update(data, {
        where: { url: data.url }
      })
    } else {
      return this.Model.create(data)
    }
  }

  async find(params?: Params): Promise<any> {
    if (params?.query?.getAvatarThumbnails === true) {
      delete params.query.getAvatarThumbnails
      const search = params?.query?.search ?? ''

      const sort = params?.query?.$sort
      const order: any[] = []
      if (sort != null) {
        Object.keys(sort).forEach((name, val) => {
          order.push([name, sort[name] === 0 ? 'DESC' : 'ASC'])
        })
      }
      const limit = params.query.$limit ?? 10
      const skip = params.query.$skip ?? 0
      const result = await super.Model.findAndCountAll({
        limit: limit,
        offset: skip,
        select: params.query.$select,
        order: order,
        where: {
          name: {
            [Op.like]: `%${search}%`
          },
          staticResourceType: params.query?.staticResourceType,
          userId: params.query?.userId
        },
        raw: true,
        nest: true
      })
      for (const item of result.rows) {
        item.thumbnail = await super.Model.findOne({
          where: {
            name: item.name,
            staticResourceType: 'user-thumbnail'
          }
        })
      }
      return {
        data: result.rows,
        total: result.count,
        skip: skip,
        limit: limit
      }
    } else return super.find(params)
  }

  async remove(id: string): Promise<T> {
    return (await super.remove(id)) as T
  }
}

import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'

import { Application } from '../../../declarations'
import { getStorageProvider } from '../storageprovider/storageprovider'

export type CreateStaticResourceType = {
  name?: string
  mimeType: string
  url: string
  key: string
  staticResourceType?: string
  userId?: string
}

export class StaticResource extends Service<StaticResourceInterface> {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  // @ts-ignore
  async create(data: CreateStaticResourceType, params?: Params): Promise<StaticResourceInterface> {
    const self = this
    const oldResource = await this.find({
      query: {
        $select: ['id'],
        url: data.url
      }
    })

    if ((oldResource as any).total > 0) {
      return this.Model.update(data, {
        where: { url: data.url }
      }).then(() => self.Model.findOne({ where: { url: data.url } }))
    } else {
      return this.Model.create(data)
    }
  }

  async find(params?: Params): Promise<StaticResourceInterface[] | Paginated<StaticResourceInterface>> {
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

  async remove(id: string): Promise<StaticResourceInterface> {
    const resource = await super.get(id)
    if (resource.key) {
      const storageProvider = getStorageProvider()
      await storageProvider.deleteResources([resource.key])
    }
    return (await super.remove(id)) as StaticResourceInterface
  }
}

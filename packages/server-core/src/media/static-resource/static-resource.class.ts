import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthenticatedException } from '../../util/exceptions/exception'
import { getStorageProvider } from '../storageprovider/storageprovider'

export type CreateStaticResourceType = {
  name?: string
  mimeType: string
  url: string
  key: string
  staticResourceType?: string
  userId?: string
  project?: string
}

export class StaticResource extends Service<StaticResourceInterface> {
  app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // @ts-ignore
  async create(data: CreateStaticResourceType, params?: UserParams): Promise<StaticResourceInterface> {
    const self = this
    const query = {
      $select: ['id'],
      url: data.url
    } as any
    if (data.project) query.project = data.project
    const oldResource = await this.find({
      query
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
    const search = params?.query?.search ?? ''
    const key = params?.query?.key ?? ''
    const mimeTypes = params?.query?.mimeTypes && params?.query?.mimeTypes.length > 0 ? params?.query?.mimeTypes : null
    const resourceTypes =
      params?.query?.resourceTypes && params?.query?.resourceTypes.length > 0 ? params?.query?.resourceTypes : null

    const sort = params?.query?.$sort
    const order: any[] = []
    if (sort != null) {
      Object.keys(sort).forEach((name, val) => {
        order.push([name, sort[name] === 0 ? 'DESC' : 'ASC'])
      })
    }
    const limit = params?.query?.$limit ?? 10
    const skip = params?.query?.$skip ?? 0
    const result = await super.Model.findAndCountAll({
      limit: limit,
      offset: skip,
      select: params?.query?.$select,
      order: order,
      where: {
        key: {
          [Op.or]: {
            [Op.like]: `%${search}%`,
            [Op.eq]: key
          }
        },
        mimeType: {
          [Op.or]: mimeTypes
        },
        staticResourceType: {
          [Op.or]: resourceTypes
        }
      },
      raw: true,
      nest: true
    })

    return {
      data: result.rows,
      total: result.count,
      skip: skip,
      limit: limit
    }
  }

  async remove(id: string, params?: UserParams): Promise<StaticResourceInterface> {
    const resource = await super.get(id)

    if (!resource) {
      throw new NotFoundException('Unable to find specified resource id.')
    }

    if (!resource.userId) {
      if (params?.provider) await verifyScope('admin', 'admin')({ app: this.app, params } as any)
    } else if (params?.provider && resource.userId !== params?.user?.id)
      throw new UnauthenticatedException('You are not the creator of this resource')

    if (resource.key) {
      const storageProvider = getStorageProvider(params?.query?.storageProviderName)
      await storageProvider.deleteResources([resource.key])
    }
    return (await super.remove(id)) as StaticResourceInterface
  }
}

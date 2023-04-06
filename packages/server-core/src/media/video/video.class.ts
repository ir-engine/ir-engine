import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { VideoInterface } from '@etherealengine/common/src/interfaces/VideoInterface'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthenticatedException } from '../../util/exceptions/exception'

export type CreateVideoType = {
  name?: string
  tags?: string[]
  duration?: number
  mp4ResourceId?: string
  m3u8ResourceId?: string
}

export class Video extends Service<VideoInterface> {
  app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // @ts-ignore
  async create(data: CreateVideoType, params?: UserParams): Promise<VideoInterface> {
    const self = this
    const query = {
      $select: ['id']
    } as any
    if (data.mp4ResourceId) query.mp4ResourceId = data.mp4ResourceId
    if (data.m3u8ResourceId) query.m3u8ResourceId = data.m3u8ResourceId
    const oldResource = await this.find({
      query
    })

    if ((oldResource as any).total > 0) {
      return this.Model.update(data, {
        where: {
          name: data.name
        }
      }).then(() => self.Model.findOne({ where: { name: data.name } }))
    } else {
      return this.Model.create(data)
    }
  }

  async find(params?: Params): Promise<VideoInterface[] | Paginated<VideoInterface>> {
    const search = params?.query?.search ?? ''
    const name = params?.query?.name ?? ''
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
      include: [
        {
          model: this.app.service('static-resource').Model,
          as: 'mp4StaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'm3u8StaticResource'
        }
      ],
      limit: limit,
      offset: skip,
      select: params?.query?.$select,
      order: order,
      where: {
        name: {
          [Op.or]: {
            [Op.like]: `%${search}%`,
            [Op.eq]: name
          }
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

  async remove(id: string, params?: UserParams): Promise<VideoInterface> {
    const resource = await super.get(id)

    if (!resource) {
      throw new NotFoundException('Unable to find specified video id.')
    }

    return (await super.remove(id)) as VideoInterface
  }
}

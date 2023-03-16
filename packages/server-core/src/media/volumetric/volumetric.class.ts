import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { VolumetricInterface } from '@etherealengine/common/src/interfaces/VolumetricInterface'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthenticatedException } from '../../util/exceptions/exception'

export type CreateVolumetricType = {
  name?: string
  tags?: string[]
  duration?: number
  videoId?: string
  manifestId?: string
  drcsStaticResourceId?: string
}

export class Volumetric extends Service<VolumetricInterface> {
  app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // @ts-ignore
  async create(data: CreateVolumetricType, params?: UserParams): Promise<VolumetricInterface> {
    const self = this
    const query = {
      $select: ['id']
    } as any
    if (data.videoId) query.videoId = data.videoId
    if (data.manifestId) query.manifestId = data.manifestId
    if (data.drcsStaticResourceId) query.drcsStaticResourceId = data.drcsStaticResourceId
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

  async find(params?: Params): Promise<VolumetricInterface[] | Paginated<VolumetricInterface>> {
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
          as: 'drcsStaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'uvolStaticResource'
        },
        {
          model: this.app.service('data').Model,
          as: 'manifest'
        },
        {
          model: this.app.service('video').Model,
          as: 'video'
        },
        {
          model: this.app.service('image').Model,
          as: 'thumbnail'
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

  async remove(id: string, params?: UserParams): Promise<VolumetricInterface> {
    const resource = await super.get(id)

    if (!resource) {
      throw new NotFoundException('Unable to find specified volumetric id.')
    }

    return (await super.remove(id)) as VolumetricInterface
  }
}

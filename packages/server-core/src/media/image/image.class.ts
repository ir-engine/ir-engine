import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { ImageInterface } from '@etherealengine/common/src/interfaces/ImageInterface'

import { Application } from '../../../declarations'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthenticatedException } from '../../util/exceptions/exception'

export type CreateImageType = {
  name?: string
  tags?: string[]
  duration?: number
  width: number
  height: number
  pngStaticResourceId?: string
  jpegStaticResourceId?: string
  gifStaticResourceId?: string
  ktx2StaticResourceId?: string
}

export class Image extends Service<ImageInterface> {
  app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: CreateImageType, params?: UserParams): Promise<ImageInterface> {
    const self = this
    const query = {
      $select: ['id']
    } as any
    if (data.jpegStaticResourceId) query.jpegStaticResourceId = data.jpegStaticResourceId
    if (data.pngStaticResourceId) query.pngStaticResourceId = data.pngStaticResourceId
    if (data.gifStaticResourceId) query.gifStaticResourceId = data.gifStaticResourceId
    if (data.ktx2StaticResourceId) query.ktx2StaticResourceId = data.ktx2StaticResourceId
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

  async find(params?: Params): Promise<ImageInterface[] | Paginated<ImageInterface>> {
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
          as: 'pngStaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'jpegStaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'gifStaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'ktx2StaticResource'
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

  async remove(id: string, params?: UserParams): Promise<ImageInterface> {
    const resource = await super.get(id)

    if (!resource) {
      throw new NotFoundException('Unable to find specified image id.')
    }

    return (await super.remove(id)) as ImageInterface
  }
}

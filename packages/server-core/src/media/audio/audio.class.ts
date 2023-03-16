import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { AudioInterface } from '@etherealengine/common/src/interfaces/AudioInterface'

import { Application } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import { UserParams } from '../../user/user/user.class'
import { NotFoundException, UnauthenticatedException } from '../../util/exceptions/exception'
import { getStorageProvider } from '../storageprovider/storageprovider'

export type CreateAudioType = {
  name?: string
  tags?: string[]
  duration?: number
  mpegResourceId?: string
  oggResourceId?: string
}

export class Audio extends Service<AudioInterface> {
  app: Application
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<AudioInterface[] | Paginated<AudioInterface>> {
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
          as: 'mp3StaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'mpegStaticResource'
        },
        {
          model: this.app.service('static-resource').Model,
          as: 'oggStaticResource'
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

  async remove(id: string, params?: UserParams): Promise<AudioInterface> {
    const resource = await super.get(id)

    if (!resource) {
      throw new NotFoundException('Unable to find specified audio id.')
    }

    return (await super.remove(id)) as AudioInterface
  }
}

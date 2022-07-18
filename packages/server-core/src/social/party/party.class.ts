import { NotFound } from '@feathersjs/errors/lib'
import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize'

import { Party as PartyDataType } from '@xrengine/common/src/interfaces/Party'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

// import { Params, Id, NullableId } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import logger from '../../logger'
import { PartyUserModelStatic } from '../party-user/party-user.model'
import { PartyModelStatic } from './party.model'

// import { Forbidden } from '@feathersjs/errors'

/**
 * A class for Party service
 */
export class Party<T = PartyDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T>> {
    const { action, $skip, $limit, search, ...query } = params?.query ?? {}
    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 10

    if (action === 'admin') {
      const sort = params?.query?.$sort
      delete query.$sort
      const order: any[] = []
      if (sort != null) {
        Object.keys(sort).forEach((name, val) => {
          const item: any[] = []

          if (name === 'instance') {
            //item.push(this.app.service('instance').Model)
            item.push(Sequelize.literal('`instance.ipAddress`'))
          } else {
            item.push(name)
          }
          item.push(sort[name] === 0 ? 'DESC' : 'ASC')

          order.push(item)
        })
      }
      let ip = {}
      let name = {}
      if (!isNaN(search)) {
        ip = search ? { ipAddress: { [Op.like]: `%${search}%` } } : {}
      } else {
        name = search ? { name: { [Op.like]: `%${search}%` } } : {}
      }

      const party = await (this.app.service('party') as any).Model.findAndCountAll({
        offset: skip,
        limit: limit,
        order: order,
        include: [
          {
            model: (this.app.service('instance') as any).Model,
            required: true,
            where: { ...ip }
          },
          {
            model: (this.app.service('party-user') as any).Model,
            required: false
          }
        ],
        where: query,
        raw: true,
        nest: true
      })

      return {
        skip: skip,
        limit: limit,
        total: party.count,
        data: party.rows
      }
    } else {
      return super.find(params)
    }
  }

  /**
   * A function which used to get specific party
   *
   * @param id of specific party
   * @param params contains user info
   * @returns {@Object} of single party
   */
  async get(id: string, params?: Params): Promise<T> {
    if (id == null || id == '') {
      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic

      const loggedInUser = params!.user as UserInterface
      const partyUserResult = await PartyUserMS.findOne({ where: { userId: loggedInUser.id } })

      if (!partyUserResult) throw new NotFound('User party not found')

      const partyId = partyUserResult.getDataValue('partyId')
      const party: any = await super.get(partyId as string)

      party.partyUsers = (await this.app.service('party-user').find({ query: { partyId: party.id } }))?.data

      return party
    } else {
      return await super.get(id)
    }
  }

  async create(_data?: {}, params?: Params): Promise<any> {
    if (!params) return null!

    try {
      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic
      const userModel = this.app.service('user').Model
      const PartyMS = this.app.service('party').Model as PartyModelStatic

      await PartyUserMS.destroy({ where: { userId: params.user.id } })

      const party = (await PartyMS.create({})).get()

      await Promise.all([
        PartyUserMS.create({ partyId: party.id, isOwner: true, userId: params.user.id }),
        userModel.update({ partyId: party.id }, { where: { id: params.user.id } })
      ])
      ;(party as any).partyUsers = (await this.app.service('party-user').find({ query: { partyId: party.id } }))?.data

      return party
    } catch (err) {
      logger.error(err)
    }

    return null!
  }
}

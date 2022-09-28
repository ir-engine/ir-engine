import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'
import { Sequelize } from 'sequelize'

import { Party as PartyDataType } from '@xrengine/common/src/interfaces/Party'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'

interface PartyRemoveParams extends Params {
  skipPartyUserDelete?: boolean
}

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
            model: (this.app.service('party-user') as any).Model
          }
        ]
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
  async get(id: string, params?: UserParams): Promise<T> {
    if (id == null || id == '') {
      const user = params!.user as UserInterface
      if (user.partyId)
        try {
          const party = (await super.get(user.partyId)) as any
          party.party_users = (
            await this.app.service('party-user').find({
              query: {
                partyId: user.partyId
              }
            })
          ).data
          return party
        } catch (err) {
          return null!
        }
    } else {
      return super.get(id, params)
    }
    return null!
  }

  async create(data?: any, params?: UserParams): Promise<any> {
    const self = this
    if (!params) return null!
    const userId = params!.user!.id

    try {
      const existingPartyUsers = await this.app.service('party-user').find({
        query: {
          userId: userId
        }
      })

      await Promise.all(
        existingPartyUsers.data.map(
          (partyUser) =>
            new Promise<void>(async (resolve, reject) => {
              try {
                await self.app.service('party-user').remove(partyUser.id)
                resolve()
              } catch (err) {
                reject(err)
              }
            })
        )
      )

      const party = (await super.create(data)) as any

      await this.app.service('party-user').create({
        partyId: party.id,
        isOwner: true,
        userId: userId
      })

      await this.app.service('user').patch(userId, {
        partyId: party.id
      })

      return this.app.service('party').get(party.id)
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async remove(id: string, params?: PartyRemoveParams): Promise<T> {
    const partyUsers = (
      await this.app.service('party-user').find({
        query: {
          partyId: id
        }
      })
    ).data
    if (!params!.skipPartyUserDelete)
      await Promise.all(
        partyUsers.map(async (partyUser) =>
          this.app.service('party-user').remove(partyUser.id, { deletingParty: true })
        )
      )
    const removedParty = (await super.remove(id)) as T
    ;(removedParty as any).party_users = partyUsers
    await this.app.service('invite').remove(null!, {
      query: {
        inviteType: 'party',
        targetObjectId: id
      }
    })
    return removedParty
  }
}

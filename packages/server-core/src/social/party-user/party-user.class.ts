import { Params } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { PartyUser as PartyUserDataType } from '@xrengine/common/src/interfaces/PartyUser'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'
import { PartyUserModelStatic } from './party-user.model'

interface PartyUserParams extends Params {
  deletingParty?: boolean
}

/**
 * A class for Party user service
 */
export class PartyUser<T = PartyUserDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: UserParams): Promise<any> {
    try {
      const self = this
      const loggedInUser = params!.user as UserInterface
      const isInternalOrAdmin =
        (params && params.isInternal) ||
        (loggedInUser.scopes && loggedInUser?.scopes.find((scope) => scope.type === 'admin:admin'))

      if (!isInternalOrAdmin && !loggedInUser) return null!

      const where = {} as any

      if (!isInternalOrAdmin) where.userId = loggedInUser.id
      if (params?.query) {
        if (typeof params.query.partyId !== 'undefined') where.partyId = params.query.partyId
        if (typeof params.query.userId !== 'undefined') where.userId = params.query.userId
        if (typeof params.query.isOwner !== 'undefined') where.isOwner = params.query.isOwner
      }

      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic
      const users = await PartyUserMS.findAll({
        where,
        include: [
          {
            model: this.app.service('user').Model
          }
        ]
      })

      users.forEach(async (partyUser: any) => {
        partyUser.user.avatar = await self.app.service('avatar').get(partyUser.user.avatarId)
        return partyUser
      })

      return { data: users, total: users.length }
    } catch (e) {
      logger.error(e)
      return null!
    }
  }

  async create(data: any, params?: Params): Promise<any> {
    const self = this
    if (!params) return null!

    try {
      const party = await this.app.service('party').get(data.partyId, {
        include: [{ model: this.app.service('channel').Model }]
      } as any)

      if (!party) return null!

      const existingPartyUsers = await this.app.service('party-user').find({
        query: {
          userId: data.userId
        }
      })

      await Promise.all(
        existingPartyUsers.data.map((partyUser) => {
          return new Promise<void>(async (resolve, reject) => {
            try {
              await self.app.service('party-user').remove(partyUser.id)
              resolve()
            } catch (err) {
              reject(err)
            }
          })
        })
      )
      const partyUser = (await super.create(data)) as any
      const user = await this.app.service('user').get(partyUser.userId)

      await this.app.service('user').patch(partyUser.userId, { partyId: partyUser.partyId })

      await this.app.service('message').create(
        {
          targetObjectId: partyUser.partyId,
          targetObjectType: 'party',
          text: `${user.name} joined the party`,
          isNotification: true
        },
        {
          'identity-provider': {
            userId: partyUser.userId
          }
        }
      )

      return partyUser
    } catch (err) {
      logger.error(err)
      return null!
    }
  }

  async patch(id: string, data: any, params?: Params): Promise<any> {
    try {
      const partyUserToPatch = await this.app.service('party-user').get(id)

      // If we're removing ownership from the party owner somehow, make another party user the owner (if there is another)
      if (partyUserToPatch.isOwner && data.isOwner === false) {
        const otherPartyUsers = await this.app.service('party-user').find({
          query: {
            partyId: partyUserToPatch.partyId,
            userId: {
              $ne: partyUserToPatch.userId
            }
          }
        })

        if (otherPartyUsers.total > 0)
          await this.app.service('party-user').patch(otherPartyUsers.data[0].id, {
            isOwner: true
          })
      }

      return super.patch(id, data, params)
    } catch (err) {
      logger.error(err)
      throw err
    }
  }

  async remove(id: string, params?: PartyUserParams): Promise<any> {
    try {
      const partyUser = (await this.app.service('party-user').get(id)) as any

      const partyUserCount = await this.app.service('party-user').Model.count({ where: { partyId: partyUser.partyId } })

      if (partyUserCount > 1 && partyUser.isOwner && !params!.deletingParty) {
        const oldestPartyUser = await this.app.service('party-user').Model.findAll({
          where: {
            partyId: partyUser.partyId,
            id: {
              [Op.ne]: partyUser.id
            }
          },
          $sort: {
            updatedAt: 1
          }
        })

        await this.app.service('party-user').patch(oldestPartyUser[0].id, { isOwner: true })
      }

      await this.app.service('user').patch(partyUser.userId, {
        partyId: null
      })

      const returned = super.remove(id, params)

      if (partyUserCount <= 1 && !params!.deletingParty)
        await this.app.service('party').remove(partyUser.partyId, { skipPartyUserDelete: true })

      return returned
    } catch (err) {
      logger.error(err)
      throw err
    }
  }
}

import { Params } from '@feathersjs/feathers/lib'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op, Sequelize } from 'sequelize'

import { PartyUser as PartyUserDataType } from '@xrengine/common/src/interfaces/PartyUser'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { PartyModelStatic } from '../party/party.model'
import { PartyUserModelStatic } from './party-user.model'

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

  async find(params?: Params): Promise<any> {
    try {
      const loggedInUser = params!.user as UserInterface
      const isInternalOrAdmin = (params && params.isInternalRequest) || loggedInUser?.userRole === 'admin'

      if (!isInternalOrAdmin && !loggedInUser) return null!

      const where = {
        [Op.and]: Sequelize.literal('`user->static_resources`.`staticResourceType` = "user-thumbnail"')
      } as any

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
            model: this.app.service('user').Model,
            include: [
              {
                model: this.app.service('static-resource').Model,
                on: Sequelize.literal('`user`.`avatarId` = `user->static_resources`.`name`')
              }
            ]
          }
        ]
      })

      return { data: users }
    } catch (e) {
      logger.error(e)
      return null!
    }
  }

  async create(data: any, params?: Params): Promise<any> {
    if (!params) return null!

    try {
      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic
      const userModel = this.app.service('user').Model
      const PartyMS = this.app.service('party').Model as PartyModelStatic

      const party = await PartyMS.findOne({
        where: { id: data.partyId },
        include: [{ model: this.app.service('channel').Model }]
      })

      if (!party) return null!

      const instance = this.app.service('instance').Model.findOne({
        where: {
          currentUsers: { [Op.lt]: party.getDataValue('maxMembers') },
          channelId: (party as any).channel.id
        }
      })

      if (!instance) return null!

      await PartyUserMS.destroy({ where: { userId: data.userId } })
      const partyUser = (await PartyUserMS.create(data)).get()
      const user = await userModel.findOne({ where: { id: partyUser.userId } })

      // context.params.oldInstanceId = user.instanceId

      await userModel.update({ partyId: partyUser.partyId }, { where: { id: partyUser.userId } })

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
      if (typeof data.isOwner === 'undefined') return super.patch(id, data, params)

      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic
      const partyUser = await PartyUserMS.findOne({ where: { userId: id } })

      if (!partyUser || !partyUser.getDataValue('isOwner')) return false

      await PartyUserMS.update({ isOwner: false }, { where: { partyId: partyUser.getDataValue('partyId') } })
      await PartyUserMS.update({ ...data, isOwner: true }, { where: { userId: data.userId } })
      return true
    } catch (err) {
      logger.error(err)
      return null!
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic
      const PartyMS = this.app.service('party').Model as PartyModelStatic
      const userModel = this.app.service('user').Model

      const partyUser = await PartyUserMS.findOne({ where: { userId: id } })
      if (!partyUser) return false

      const partyUserCount = await PartyUserMS.count({ where: { partyId: partyUser?.getDataValue('partyId') } })

      if (partyUserCount <= 1) {
        await PartyMS.destroy({ where: { id: partyUser.getDataValue('partyId') } })
        return partyUser
      } else if (partyUser?.getDataValue('isOwner')) {
        const oldestPartyUser = await PartyUserMS.findOne({
          limit: 1,
          order: [['updatedAt', 'ASC']]
        })

        await oldestPartyUser?.update({ isOwner: true })
      }

      await userModel.update({ partyId: null }, { where: { id: partyUser.getDataValue('userId') } })
      await partyUser?.destroy()

      return partyUser
    } catch (e) {
      logger.error(e)
      return null!
    }
  }
}

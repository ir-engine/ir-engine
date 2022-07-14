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

  async remove(id: string): Promise<any> {
    try {
      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic
      const PartyMS = this.app.service('party').Model as PartyModelStatic

      const partyUser = await PartyUserMS.findOne({ where: { userId: id } })
      const partyUserCount = await PartyUserMS.count({ where: { partyId: partyUser?.getDataValue('partyId') } })

      if (partyUserCount < 1) await PartyMS.destroy({ where: { id: partyUser?.getDataValue('partyId') } })
      else if (partyUser?.getDataValue('isOwner')) {
        const oldestPartyUser = await PartyUserMS.findOne({
          limit: 1,
          order: [['updatedAt', 'ASC']]
        })

        await oldestPartyUser?.update({ isOwner: true })
      }

      await partyUser?.destroy()
    } catch (e) {
      logger.error(e)
      return null!
    }
  }
}

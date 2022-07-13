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
      const PartyUserMS = this.app.service('party-user').Model as PartyUserModelStatic

      const loggedInUser = params!.user as UserInterface

      console.debug(loggedInUser)
      const partyUser = await PartyUserMS.findOne({ where: { userId: loggedInUser.id } })

      console.debug(partyUser)

      await PartyUserMS.findAll({
        where: {
          partyId: loggedInUser.id,
          [Op.and]: Sequelize.literal('`user->static_resources`.`staticResourceType` = "user-thumbnail"')
        },
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

      console.debug(partyUser)

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

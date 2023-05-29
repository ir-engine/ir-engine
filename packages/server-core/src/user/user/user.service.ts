import _ from 'lodash'
import { Op } from 'sequelize'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { User } from './user.class'
import userDocs from './user.docs'
import hooks from './user.hooks'
import createModel from './user.model'

declare module '@etherealengine/common/declarations' {
  /**
   * Interface for users input
   */
  interface ServiceTypes {
    user: User
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new User(options, app)
  event.docs = userDocs

  app.use('user', event)

  const service = app.service('user')

  service.hooks(hooks)

  // when seeding db, no need to patch users
  if (config.db.forceRefresh) return

  /**
   * This method find all users
   * @returns users
   */

  // @ts-ignore
  service.publish('patched', async (data: UserInterface, params): Promise<any> => {
    try {
      const groupUsers = await app.service('group-user').Model.findAll({
        where: {
          userId: data.id
        }
      })
      const userRelationships = await app.service('user-relationship').Model.findAll({
        where: {
          userRelationshipType: 'friend',
          relatedUserId: data.id
        }
      })

      let targetIds = [data.id!]
      const updatePromises: any[] = []

      const instances = await app.service('instance-attendance').Model.findAll({
        where: {
          userId: data.id,
          ended: 0
        }
      })
      const layerUsers = await app.service('user').Model.findAll({
        include: [
          {
            model: app.service('instance-attendance').Model,
            as: 'instanceAttendance',
            where: {
              instanceId: {
                [Op.in]: instances.map((instance) => instance.instanceId)
              }
            }
          }
        ],
        where: {
          id: {
            [Op.ne]: data.id
          }
        }
      })
      targetIds = targetIds.concat(layerUsers.map((user) => user.id))

      groupUsers.forEach((groupUser) => {
        updatePromises.push(
          app.service('group-user').patch(groupUser.id, {
            groupUserRank: groupUser.groupUserRank
          })
        )
        targetIds.push(groupUser.userId)
      })
      // userRelationships.forEach((userRelationship) => {
      //   updatePromises.push(
      //     app.service('user-relationship').patch(
      //       userRelationship.id,
      //       {
      //         userRelationshipType: userRelationship.userRelationshipType,
      //         userId: userRelationship.userId
      //       },
      //       params
      //     )
      //   )
      //   targetIds.push(userRelationship.userId)
      //   targetIds.push(userRelationship.relatedUserId)
      // })

      await Promise.all(updatePromises)
      targetIds = _.uniq(targetIds)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send(data)
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

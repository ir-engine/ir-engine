import { Application } from '../../../declarations'
import { User } from './user.class'
import createModel from './user.model'
import hooks from './user.hooks'
import _ from 'lodash'
import logger from '../../logger'
import userDocs from './user.docs'

declare module '../../../declarations' {
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

  /**
   * This method find all users
   * @returns users
   */

  service.publish('patched', async (data, params): Promise<any> => {
    try {
      const groupUsers = await app.service('group-user').Model.findAll({
        where: {
          userId: data.id
        }
      })
      const partyUsers = await app.service('party-user').Model.findAll({
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

      let targetIds = [data.id]
      const updatePromises = []

      let layerUsers = []
      if (data.instanceId != null || params.params?.instanceId != null) {
        layerUsers = await app.service('user').Model.findAll({
          where: {
            instanceId: data.instanceId || params.params?.instanceId
          }
        })
        targetIds = targetIds.concat(layerUsers.map((user) => user.id))
      }

      groupUsers.forEach((groupUser) => {
        updatePromises.push(
          app.service('group-user').patch(groupUser.id, {
            groupUserRank: groupUser.groupUserRank
          })
        )
        targetIds.push(groupUser.userId)
      })
      partyUsers.forEach((partyUser) => {
        updatePromises.push(
          app.service('party-user').patch(
            partyUser.id,
            {
              isOwner: partyUser.isOwner
            },
            params
          )
        )
        targetIds.push(partyUser.userId)
      })
      userRelationships.forEach((userRelationship) => {
        updatePromises.push(
          app.service('user-relationship').patch(
            userRelationship.id,
            {
              userRelationshipType: userRelationship.userRelationshipType,
              userId: userRelationship.userId
            },
            params
          )
        )
        targetIds.push(userRelationship.userId)
        targetIds.push(userRelationship.relatedUserId)
      })

      await Promise.all(updatePromises)
      targetIds = _.uniq(targetIds)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            userRelationship: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

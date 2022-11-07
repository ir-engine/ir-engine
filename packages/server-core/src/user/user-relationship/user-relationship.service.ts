import { Op } from 'sequelize'

import { UserRelationshipInterface } from '@xrengine/common/src/dbmodels/UserRelationship'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserRelationship } from './user-relationship.class'
import userRelationshipDocs from './user-relationship.docs'
import hooks from './user-relationship.hooks'
import createModel from './user-relationship.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'user-relationship': UserRelationship
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new UserRelationship(options, app)
  event.docs = userRelationshipDocs
  app.use('user-relationship', event)

  const service = app.service('user-relationship')

  service.hooks(hooks)

  service.publish('created', async (data: UserRelationshipInterface): Promise<any> => {
    try {
      const inverseRelationship = await app.service('user-relationship').Model.findOne({
        where: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'requested' && inverseRelationship != null) {
        if (data?.dataValues != null) {
          data.dataValues.user = await app.service('user').get(data.userId)
          data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
        } else {
          ;(data as any).user = await app.service('user').get(data.userId)
          ;(data as any).relatedUser = await app.service('user').get(data.relatedUserId)
        }

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(
          targetIds.map((userId: string) => {
            return app.channel(`userIds/${userId}`).send({
              userRelationship: data
            })
          })
        )
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data: UserRelationshipInterface): Promise<any> => {
    try {
      const inverseRelationship = await app.service('user-relationship').Model.findOne({
        where: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'friend' && inverseRelationship != null) {
        if (data?.dataValues != null) {
          data.dataValues.user = await app.service('user').get(data.userId)
          data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
        } else {
          ;(data as any).user = await app.service('user').get(data.userId)
          ;(data as any).relatedUser = await app.service('user').get(data.relatedUserId)
        }

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(
          targetIds.map((userId: string) => {
            return app.channel(`userIds/${userId}`).send({
              userRelationship: data
            })
          })
        )
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('removed', async (data: UserRelationshipInterface): Promise<any> => {
    try {
      console.log('relationship removed data', data)
      const channel = await app.service('channel').Model.findOne({
        where: {
          [Op.or]: [
            {
              userId1: data.userId,
              userId2: data.relatedUserId
            },
            {
              userId2: data.userId,
              userId1: data.relatedUserId
            }
          ]
        }
      })
      if (channel != null) {
        await app.service('channel').remove(channel.id)
      }
      if (data?.dataValues != null) {
        data.dataValues.user = await app.service('user').get(data.userId)
        data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
      } else {
        ;(data as any).user = await app.service('user').get(data.userId)
        ;(data as any).relatedUser = await app.service('user').get(data.relatedUserId)
      }
      const targetIds = [data.userId, data.relatedUserId]
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(
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

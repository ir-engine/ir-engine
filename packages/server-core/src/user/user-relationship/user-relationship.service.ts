import { Application } from '../../../declarations'
import { UserRelationship } from './user-relationship.class'
import createModel from './user-relationship.model'
import hooks from './user-relationship.hooks'
import { Op } from 'sequelize'
import logger from '../../logger'
import userRalationshipDocs from './user-ralationship.docs'

declare module '../../../declarations' {
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
   *
   * @author Vyacheslav Solovjov
   */
  const event = new UserRelationship(options, app)
  event.docs = userRalationshipDocs
  app.use('user-relationship', event)

  const service = app.service('user-relationship')

  service.hooks(hooks)

  // service.publish('created', async (data): Promise<any> => {
  //   data.user1 = await app.service('user').get(data.userId1)
  //   data.user2 = await app.service('user').get(data.userId2)
  //   const avatar1Result = await app.service('static-resource').find({
  //     query: {
  //       staticResourceType: 'user-thumbnail',
  //       userId: data.userId1
  //     }
  //   }) as any
  //
  //   if (avatar1Result.total > 0) {
  //     data.user1.dataValues.avatarUrl = avatar1Result.data[0].url
  //   }
  //
  //   const avatar2Result = await app.service('static-resource').find({
  //     query: {
  //       staticResourceType: 'user-thumbnail',
  //       userId: data.userId2
  //     }
  //   }) as any
  //
  //   if (avatar2Result.total > 0) {
  //     data.user2.dataValues.avatarUrl = avatar2Result.data[0].url
  //   }
  //
  //   const targetIds = [data.userId1, data.userId2]
  //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //   return Promise.all(targetIds.map((userId) => {
  //     return app.channel(`userIds/${userId}`).send({
  //       userRelationship: data
  //     })
  //   }))
  // })

  service.publish('patched', async (data): Promise<any> => {
    try {
      const inverseRelationship = await (app.service('user-relationship') as any).Model.findOne({
        where: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'friend' && inverseRelationship != null) {
        // const channel = await (app.service('channel') as any).Model.findOne({
        //   where: {
        //     [Op.or]: [
        //       {
        //         userId1: data.userId,
        //         userId2: data.relatedUserId
        //       },
        //       {
        //         userId2: data.userId,
        //         userId1: data.relatedUserId
        //       }
        //     ]
        //   }
        // });
        // if (channel != null) {
        //   await app.service('channel').patch(channel.id, {
        //     channelType: channel.channelType
        //   }, {
        //     sequelize: {
        //       silent: true
        //     }
        //   });
        // }
        if (data?.dataValues != null) {
          data.dataValues.user = await app.service('user').get(data.userId)
          data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
        } else {
          data.user = await app.service('user').get(data.userId)
          data.relatedUser = await app.service('user').get(data.relatedUserId)
        }
        // const avatarResult = await app.service('static-resource').find({
        //   query: {
        //     staticResourceType: 'user-thumbnail',
        //     userId: data.userId
        //   }
        // }) as any;
        //
        // if (avatarResult.total > 0) {
        //   if (data.dataValues != null) {
        //     data.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
        //   } else {
        //     data.user.avatarUrl = avatarResult.data[0].url;
        //   }
        // }

        // const relatedAvatarResult = await app.service('static-resource').find({
        //   query: {
        //     staticResourceType: 'user-thumbnail',
        //     userId: data.relatedUserId
        //   }
        // }) as any;
        //
        // if (relatedAvatarResult.total > 0) {
        //   if (data.dataValues != null) {
        //     data.dataValues.relatedUser.dataValues.avatarUrl = relatedAvatarResult.data[0].url;
        //   } else {
        //     data.relatedUser.avatarUrl = relatedAvatarResult.data[0].url;
        //   }
        // }

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

  service.publish('removed', async (data): Promise<any> => {
    try {
      const channel = await (app.service('channel') as any).Model.findOne({
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

import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { UserRelationship } from './user-relationship.class'
import createModel from '../../models/user-relationship.model'
import hooks from './user-relationship.hooks'
import { Op } from 'sequelize'

declare module '../../declarations' {
  interface ServiceTypes {
    'user-relationship': UserRelationship & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/user-relationship', new UserRelationship(options, app))

  const service = app.service('user-relationship')

  service.hooks(hooks)

  // service.publish('created', async (data): Promise<any> => {
  //   console.log('Publishing user-relationship created')
  //   console.log(data)
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
  //   console.log('friend patch targetIds:')
  //   console.log(targetIds)
  //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //   return Promise.all(targetIds.map((userId) => {
  //     return app.channel(`userIds/${userId}`).send({
  //       userRelationship: data
  //     })
  //   }))
  // })

  service.publish('patched', async (data): Promise<any> => {
    try {
      console.log('Publishing user-relationship patched')
      console.log(data)
      const inverseRelationship = await app.service('user-relationship').Model.findOne({
        where: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      console.log('Inverse user relationship:')
      console.log(inverseRelationship)
      if (data.userRelationshipType === 'friend' && inverseRelationship != null) {
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
        console.log('user-relationship channel:')
        console.log(channel)
        if (channel != null) {
          await app.service('channel').patch(channel.id, {
            channelType: channel.channelType
          }, {
            sequelize: {
              silent: true
            }
          })
        }
        data.dataValues.user = await app.service('user').get(data.userId)
        data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
        const avatarResult = await app.service('static-resource').find({
          query: {
            staticResourceType: 'user-thumbnail',
            userId: data.userId
          }
        }) as any

        console.log(data)
        if (avatarResult.total > 0) {
          data.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url
        }

        const relatedAvatarResult = await app.service('static-resource').find({
          query: {
            staticResourceType: 'user-thumbnail',
            userId: data.relatedUserId
          }
        }) as any

        if (relatedAvatarResult.total > 0) {
          data.dataValues.relatedUser.dataValues.avatarUrl = relatedAvatarResult.data[0].url
        }

        const targetIds = [data.userId, data.relatedUserId]
        console.log('friend patch targetIds:')
        console.log(targetIds)
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return Promise.all(targetIds.map((userId) => {
          return app.channel(`userIds/${userId}`).send({
            userRelationship: data
          })
        }))
      }
    } catch(err) {
      console.log(err)
      throw err
    }
  })

  service.publish('removed', async (data): Promise<any> => {
    try {
      console.log('Publishing user-relationship removed')
      console.log(data)
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
      console.log(channel)
      if (channel != null) {
        await app.service('channel').remove(channel.id)
      }
      const targetIds = [data.userId, data.relatedUserId]
      console.log('User-relationship removal targets:')
      console.log(targetIds)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId) => {
        return app.channel(`userIds/${userId}`).send({
          userRelationship: data
        })
      }))
    } catch(err) {
      console.log(err)
      throw err
    }
  })
}

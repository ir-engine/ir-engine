// Initializes the `invite` service on path `/invite`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Invite } from './invite.class'
import createModel from '../../models/invite.model'
import hooks from './invite.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'invite': Invite & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/invite', new Invite(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('invite')

  service.hooks(hooks)

  service.publish('created', async (data): Promise<any> => {
    try {
      data.user = await app.service('user').get(data.userId)
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: data.userId
        }
      }) as any

      if (avatarResult.total > 0) {
        data.user.dataValues.avatarUrl = avatarResult.data[0].url
      }
      const targetIds = [data.userId]
      if (data.inviteeId) {
        data.invitee = await app.service('user').get(data.inviteeId)
        targetIds.push(data.inviteeId)
        const avatarResult = await app.service('static-resource').find({
          query: {
            staticResourceType: 'user-thumbnail',
            userId: data.inviteeId
          }
        }) as any

        if (avatarResult.total > 0) {
          data.invitee.dataValues.avatarUrl = avatarResult.data[0].url
        }
      } else {
        const inviteeIdentityProvider = await app.service('identity-provider').Model.findOne({
          where: {
            token: data.token
          }
        })
        if (inviteeIdentityProvider.userId != null) {
          data.inviteeId = inviteeIdentityProvider.userId
          data.invitee = await app.service('user').get(inviteeIdentityProvider.userId)
          targetIds.push(inviteeIdentityProvider.userId)
          const avatarResult = await app.service('static-resource').find({
            query: {
              staticResourceType: 'user-thumbnail',
              userId: inviteeIdentityProvider.userId
            }
          }) as any

          if (avatarResult.total > 0) {
            data.invitee.dataValues.avatarUrl = avatarResult.data[0].url
          }
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          invite: data
        })
      }))
    } catch (err) {
      console.log(err)
      throw err
    }
  })

  service.publish('removed', async (data): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProvider = await app.service('identity-provider').Model.findOne({
          where: {
            token: data.token
          }
        })
        targetIds.push(inviteeIdentityProvider.userId)
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          invite: data
        })
      }))
    } catch (err) {
      console.log(err)
      throw err
    }
  })
}

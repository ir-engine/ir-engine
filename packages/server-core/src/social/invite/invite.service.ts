// Initializes the `invite` service on path `/invite`
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { InviteDataType } from './invite.class'
import { Invite } from './invite.class'
import inviteDocs from './invite.docs'
import hooks from './invite.hooks'
import createModel from './invite.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    invite: Invite
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
  const event = new Invite(options, app)
  event.docs = inviteDocs
  app.use('invite', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('invite')

  service.hooks(hooks)

  /**
   * A method which is used to create invite
   *
   * @param data which is parsed to create invite
   * @returns created invite data
   */
  service.publish('created', async (data: InviteDataType): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProviderResult = await app.service('identity-provider').find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        })
        if ((inviteeIdentityProviderResult as any).total > 0) {
          targetIds.push((inviteeIdentityProviderResult as any).data[0].userId)
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            invite: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to remove specific invite
   *
   * @param data which contains userId and inviteeId
   * @returns deleted channel with invite data
   */

  service.publish('removed', async (data: InviteDataType): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProviderResult = await app.service('identity-provider').find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        })
        if ((inviteeIdentityProviderResult as any).total > 0) {
          targetIds.push((inviteeIdentityProviderResult as any).data[0].userId)
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            invite: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

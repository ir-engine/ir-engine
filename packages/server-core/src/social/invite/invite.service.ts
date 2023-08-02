/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

// Initializes the `invite` service on path `/invite`
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { Invite, InviteDataType } from './invite.class'
import inviteDocs from './invite.docs'
import hooks from './invite.hooks'
import createModel from './invite.model'

// Add this service to the service type index
declare module '@etherealengine/common/declarations' {
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
          return app.channel(`userIds/${userId}`).send(data)
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
          return app.channel(`userIds/${userId}`).send(data)
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

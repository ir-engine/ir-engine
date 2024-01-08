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

import { Application } from '../../../declarations'

import { InviteType, inviteMethods, invitePath } from '@etherealengine/common/src/schemas/social/invite.schema'
import {
  IdentityProviderType,
  identityProviderPath
} from '@etherealengine/common/src/schemas/user/identity-provider.schema'
import { UserID } from '@etherealengine/common/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'
import logger from '../../ServerLogger'
import { InviteService } from './invite.class'
import inviteDocs from './invite.docs'
import hooks from './invite.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [invitePath]: InviteService
  }
}

export default (app: Application): void => {
  const options = {
    name: invitePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(invitePath, new InviteService(options), {
    // A list of all methods this service exposes externally
    methods: inviteMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: inviteDocs
  })

  const service = app.service(invitePath)
  service.hooks(hooks)

  /**
   * A method which is used to create invite
   *
   * @param data which is parsed to create invite
   * @returns created invite data
   */
  service.publish('created', async (data: InviteType): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProviderResult = (await app.service(identityProviderPath).find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        })) as Paginated<IdentityProviderType>
        if (inviteeIdentityProviderResult.total > 0) {
          targetIds.push(inviteeIdentityProviderResult.data[0].userId)
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
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

  service.publish('removed', async (data: InviteType): Promise<any> => {
    try {
      const targetIds = [data.userId]
      if (data.inviteeId) {
        targetIds.push(data.inviteeId)
      } else {
        const inviteeIdentityProviderResult = (await app.service(identityProviderPath).find({
          query: {
            type: data.identityProviderType,
            token: data.token
          }
        })) as Paginated<IdentityProviderType>
        if (inviteeIdentityProviderResult.total > 0) {
          targetIds.push(inviteeIdentityProviderResult.data[0].userId)
        }
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

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

import { Instance as InstanceInterface } from '@etherealengine/common/src/interfaces/Instance'

import { scopePath, ScopeType } from '@etherealengine/engine/src/schemas/scope/scope.schema'
import { channelPath, ChannelType } from '@etherealengine/engine/src/schemas/social/channel.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Paginated } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { Instance } from './instance.class'
import instanceDocs from './instance.docs'
import hooks from './instance.hooks'
import createModel from './instance.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    instance: Instance
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
  const event = new Instance(options, app)
  event.docs = instanceDocs
  app.use('instance', event)

  const service = app.service('instance')

  service.hooks(hooks)

  /**
   * A method used to remove specific instance
   *
   * @param data
   * @returns deleted channel
   */
  service.publish('removed', async (data): Promise<any> => {
    try {
      const adminScopes = (await app.service(scopePath).find({
        query: {
          type: 'admin:admin'
        },
        paginate: false
      })) as ScopeType[]

      const targetIds = adminScopes.map((admin) => admin.userId)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(
        targetIds.map((userId: UserID) =>
          app.channel(`userIds/${userId}`).send({
            instance: data
          })
        )
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data: InstanceInterface): Promise<any> => {
    try {
      /** Remove channel if instance is a world server and it has ended */
      if (data.locationId && data.ended && !data.channelId) {
        const channel = (await app.service(channelPath)._find({
          query: {
            instanceId: data.id,
            $limit: 1
          }
        })) as Paginated<ChannelType>
        await app.service(channelPath).remove(channel.data[0].id)
      }
    } catch (e) {
      // fine - channel already cleaned up elsewhere
    }
  })
}

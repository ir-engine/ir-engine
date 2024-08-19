/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'

import { instanceMethods, instancePath, InstanceType } from '@ir-engine/common/src/schemas/networking/instance.schema'
import { scopePath, ScopeType, ScopeTypeInterface } from '@ir-engine/common/src/schemas/scope/scope.schema'
import { channelPath, ChannelType } from '@ir-engine/common/src/schemas/social/channel.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application, HookContext } from '../../../declarations'
import logger from '../../ServerLogger'
import { InstanceService } from './instance.class'
import instanceDocs from './instance.docs'
import hooks from './instance.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instancePath]: InstanceService
  }
}

export default (app: Application): void => {
  const options = {
    name: instancePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(instancePath, new InstanceService(options), {
    // A list of all methods this service exposes externally
    methods: instanceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: instanceDocs
  })

  const service = app.service(instancePath)
  service.hooks(hooks)

  /**
   * A method used to remove specific instance
   *
   * @param data
   * @returns deleted channel
   */
  service.publish('removed', async (data, context: HookContext): Promise<any> => {
    try {
      const adminScopes = (await app.service(scopePath).find({
        query: {
          type: 'admin:admin' as ScopeType
        },
        headers: context.params.headers,
        paginate: false
      })) as unknown as ScopeTypeInterface[]

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

  service.publish('patched', async (data: InstanceType): Promise<any> => {
    try {
      /** Remove channel if instance is a world server and it has ended */
      if (data.locationId && data.ended && !data.channelId) {
        const channel = (await app.service(channelPath).find({
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

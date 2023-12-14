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

import '@feathersjs/transport-commons'

import { ChannelType, channelMethods, channelPath } from '@etherealengine/engine/src/schemas/social/channel.schema'

import { ChannelUserType, channelUserPath } from '@etherealengine/engine/src/schemas/social/channel-user.schema'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application, HookContext } from '../../../declarations'
import { ChannelService } from './channel.class'
import channelDocs from './channel.docs'
import hooks from './channel.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [channelPath]: ChannelService
  }
}

export default (app: Application): void => {
  const options = {
    name: channelPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(channelPath, new ChannelService(options), {
    // A list of all methods this service exposes externally
    methods: channelMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: channelDocs
  })

  const service = app.service(channelPath)
  service.hooks(hooks)

  const onCRUD =
    (app: Application) =>
    async (data: ChannelType, context: HookContext): Promise<any> => {
      const channelUsers = (await app.service(channelUserPath).find({
        query: {
          channelId: data.id
        },
        headers: context.params.headers,
        paginate: false
      })) as unknown as ChannelUserType[]

      const userIds = channelUsers.map((channelUser) => {
        return channelUser.userId
      })

      return Promise.all(userIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    }
  service.publish('created', onCRUD(app))
  service.publish('patched', onCRUD(app))
}

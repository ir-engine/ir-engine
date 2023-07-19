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

import { Channel as Channelinterface } from '@etherealengine/common/src/interfaces/Channel'

import { Application } from '../../../declarations'
import { Channel } from './channel.class'
import channelDocs from './channel.docs'
import hooks from './channel.hooks'
import createModel from './channel.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    channel: Channel
  }
}

export const onCRUD =
  (app: Application) =>
  async (data: Channelinterface): Promise<any> => {
    const channelUsers = await app.service('channel-user').find({
      query: {
        channelId: data.id
      }
    })

    const userIds = (channelUsers as any).data.map((channelUser) => {
      return channelUser.userId
    })

    return Promise.all(
      userIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send(data)
      })
    )
  }

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Channel(options, app)
  event.docs = channelDocs

  app.use('channel', event)

  const service: any = app.service('channel')

  service.hooks(hooks)

  service.publish('created', onCRUD(app))
  service.publish('patched', onCRUD(app))

  // service.publish('removed', async (data): Promise<any> => {
  //   let targetIds
  //   if (data.channelType === 'user') {
  //     targetIds = [data.userId1, data.userId2]
  //   } else if (data.channelType === 'group') {
  //     const groupUsers = await app.service('group-user').Model.findAll({
  //       where: {
  //         groupId: data.groupId
  //       }
  //     })
  //     targetIds = groupUsers.map((groupUser) => groupUser.userId)
  //   } else if (data.channelType === 'party') {
  //     const partyUsers = await app.service('party-user').Model.findAll({ where: { partyId: data.partyId } })
  //     targetIds = partyUsers.map((partyUser) => partyUser.userId)
  //   } else if (data.channelType === 'instance') {
  //     const instanceUsers = await app.service('user').Model.findAll({
  //       sequelize: {
  //         include: {
  //           model: 'instance-attendance'
  //         },
  //         where: {
  //           instanceId: data.instanceId
  //         }
  //       }
  //     })
  //     targetIds = instanceUsers.map((instanceUser) => instanceUser.id)
  //   }
  //   // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  //   return Promise.all(
  //     targetIds.map((userId) => {
  //       return app.channel(`userIds/${userId}`).send({
  //         channel: data
  //       })
  //     })
  //   )
  // })
}

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
import logger from '../../ServerLogger'
import { ChannelUser } from './channel-user.class'
import channelUserDocs from './channel-user.docs'
import hooks from './channel-user.hooks'
import createModel from './channel-user.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'channel-user': ChannelUser
  }
}

/**
 * @todo
 * - destroy channel after last person leaves
 */

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new ChannelUser(options, app)
  event.docs = channelUserDocs
  app.use('channel-user', event)

  const service = app.service('channel-user')

  service.hooks(hooks)

  /**
   * A method which is used to create channel user
   *
   * @param data which is parsed to create channel user
   * @returns created channel user
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      app.service('channel').emit('refresh', {
        userId: data.userId
      })
      const channelUsers = await app.service('channel-user').find({
        query: {
          $limit: 1000,
          channelId: data.channelId
        }
      })
      data.user = await app.service('user').get(data.userId)
      const targetIds = (channelUsers as any).data.map((channelUser) => {
        return channelUser.userId
      })
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            channelUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to update channel user
   *
   * @param data which is used to update channel user
   * @returns updated ChannelUser data
   */
  service.publish('patched', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel')).Model.findOne({
      //   where: {
      //     channelId: data.channelId
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
      const channelUsers = await app.service('channel-user').find({
        query: {
          $limit: 1000,
          channelId: data.channelId
        }
      })
      data.user = await app.service('user').get(data.userId)

      const targetIds = (channelUsers as any).data.map((channelUser) => {
        return channelUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            channelUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to remove specific channelUser
   *
   * @param data which contains channelId
   * @returns deleted channel data
   */
  service.publish('removed', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel')).Model.findOne({
      //   where: {
      //     channelId: data.channelId
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
      const channelUsers = await app.service('channel-user').find({
        query: {
          $limit: 1000,
          channelId: data.channelId
        }
      })
      const targetIds = (channelUsers as any).data.map((channelUser) => {
        return channelUser.userId
      })
      targetIds.push(data.userId)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            channelUser: data,
            self: userId === data.userId
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

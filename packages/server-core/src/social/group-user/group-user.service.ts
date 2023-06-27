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
import { GroupUser } from './group-user.class'
import groupUserDocs from './group-user.docs'
import hooks from './group-user.hooks'
import createModel from './group-user.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'group-user': GroupUser
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
  const event = new GroupUser(options, app)
  event.docs = groupUserDocs
  app.use('group-user', event)

  const service = app.service('group-user')

  service.hooks(hooks)

  /**
   * A method which is used to create group user
   *
   * @param data which is parsed to create group user
   * @returns created group user
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      app.service('group').emit('refresh', {
        userId: data.userId
      })
      // const channel = await (app.service('channel')).Model.findOne({
      //   where: {
      //     groupId: data.groupId
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
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      })
      data.user = await app.service('user').get(data.userId)
      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            groupUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to update group user
   *
   * @param data which is used to update group user
   * @returns updated GroupUser data
   */
  service.publish('patched', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel')).Model.findOne({
      //   where: {
      //     groupId: data.groupId
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
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      })
      data.user = await app.service('user').get(data.userId)

      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            groupUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to remove specific groupUser
   *
   * @param data which contains groupId
   * @returns deleted channel data
   */
  service.publish('removed', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel')).Model.findOne({
      //   where: {
      //     groupId: data.groupId
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
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      })
      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
      targetIds.push(data.userId)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            groupUser: data,
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

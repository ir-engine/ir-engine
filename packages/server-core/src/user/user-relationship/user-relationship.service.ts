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

import { Op } from 'sequelize'

import { UserRelationshipInterface } from '@etherealengine/common/src/dbmodels/UserRelationship'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserRelationship } from './user-relationship.class'
import userRelationshipDocs from './user-relationship.docs'
import hooks from './user-relationship.hooks'
import createModel from './user-relationship.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'user-relationship': UserRelationship
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
  const event = new UserRelationship(options, app)
  event.docs = userRelationshipDocs
  app.use('user-relationship', event)

  const service = app.service('user-relationship')

  service.hooks(hooks)

  service.publish('created', async (data: UserRelationshipInterface): Promise<any> => {
    try {
      const inverseRelationship = await app.service('user-relationship').Model.findOne({
        where: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'requested' && inverseRelationship != null) {
        if (data?.dataValues != null) {
          data.dataValues.user = await app.service('user').get(data.userId)
          data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
        } else {
          ;(data as any).user = await app.service('user').get(data.userId)
          ;(data as any).relatedUser = await app.service('user').get(data.relatedUserId)
        }

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(
          targetIds.map((userId: string) => {
            return app.channel(`userIds/${userId}`).send(data)
          })
        )
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data: UserRelationshipInterface): Promise<any> => {
    try {
      const inverseRelationship = await app.service('user-relationship').Model.findOne({
        where: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'friend' && inverseRelationship != null) {
        if (data?.dataValues != null) {
          data.dataValues.user = await app.service('user').get(data.userId)
          data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
        } else {
          ;(data as any).user = await app.service('user').get(data.userId)
          ;(data as any).relatedUser = await app.service('user').get(data.relatedUserId)
        }

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(
          targetIds.map((userId: string) => {
            return app.channel(`userIds/${userId}`).send(data)
          })
        )
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('removed', async (data: UserRelationshipInterface): Promise<any> => {
    try {
      console.log('relationship removed data', data)
      const channel = await app.service('channel').Model.findOne({
        where: {
          [Op.or]: [
            {
              userId1: data.userId,
              userId2: data.relatedUserId
            },
            {
              userId2: data.userId,
              userId1: data.relatedUserId
            }
          ]
        }
      })
      if (channel != null) {
        await app.service('channel').remove(channel.id)
      }
      if (data?.dataValues != null) {
        data.dataValues.user = await app.service('user').get(data.userId)
        data.dataValues.relatedUser = await app.service('user').get(data.relatedUserId)
      } else {
        ;(data as any).user = await app.service('user').get(data.userId)
        ;(data as any).relatedUser = await app.service('user').get(data.relatedUserId)
      }
      const targetIds = [data.userId, data.relatedUserId]
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(
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

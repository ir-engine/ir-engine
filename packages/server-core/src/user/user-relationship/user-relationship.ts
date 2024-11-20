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

import {
  userRelationshipMethods,
  userRelationshipPath,
  UserRelationshipType
} from '@ir-engine/common/src/schemas/user/user-relationship.schema'
import { UserID, userPath } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserRelationshipService } from './user-relationship.class'
import userRelationshipDocs from './user-relationship.docs'
import hooks from './user-relationship.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userRelationshipPath]: UserRelationshipService
  }
}

export default (app: Application): void => {
  const options = {
    name: userRelationshipPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userRelationshipPath, new UserRelationshipService(options), {
    // A list of all methods this service exposes externally
    methods: userRelationshipMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userRelationshipDocs
  })

  const service = app.service(userRelationshipPath)
  service.hooks(hooks)

  service.publish('created', async (data: UserRelationshipType): Promise<any> => {
    try {
      const inverseRelationship = await app.service(userRelationshipPath).find({
        query: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'requested' && inverseRelationship.data.length > 0) {
        if (!data.user) data.user = await app.service(userPath).get(data.userId)
        if (!data.relatedUser) data.relatedUser = await app.service(userPath).get(data.relatedUserId)

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('patched', async (data: UserRelationshipType): Promise<any> => {
    try {
      const inverseRelationship = await app.service(userRelationshipPath).find({
        query: {
          relatedUserId: data.userId,
          userId: data.relatedUserId
        }
      })
      if (data.userRelationshipType === 'friend' && inverseRelationship.data.length > 0) {
        if (!data.user) data.user = await app.service(userPath).get(data.userId)
        if (!data.relatedUser) data.relatedUser = await app.service(userPath).get(data.relatedUserId)

        const targetIds = [data.userId, data.relatedUserId]
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        return await Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
      }
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  service.publish('removed', async (data: UserRelationshipType): Promise<any> => {
    try {
      const targetIds = [data.userId, data.relatedUserId]
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return await Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

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

import { Knex } from 'knex'
import _ from 'lodash'

import {
  instanceAttendancePath,
  InstanceAttendanceType
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'
import {
  userAvatarMethods,
  userAvatarPath,
  UserAvatarType
} from '@ir-engine/common/src/schemas/user/user-avatar.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '@ir-engine/server-core/declarations'

import config from '../../appconfig'
import logger from '../../ServerLogger'
import { UserAvatarService } from './user-avatar.class'
import userAvatarDocs from './user-avatar.docs'
import hooks from './user-avatar.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userAvatarPath]: UserAvatarService
  }
}

export default (app: Application): void => {
  const options = {
    name: userAvatarPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userAvatarPath, new UserAvatarService(options), {
    // A list of all methods this service exposes externally
    methods: userAvatarMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userAvatarDocs
  })

  const service = app.service(userAvatarPath)
  service.hooks(hooks)

  // when seeding db, no need to patch users
  if (config.db.forceRefresh) return

  /**
   * This method find all users
   * @returns users
   */
  service.publish('patched', async (data: UserAvatarType) => {
    try {
      const userId = data.userId

      const instances = (await app.service(instanceAttendancePath).find({
        query: {
          userId,
          ended: false
        },
        paginate: false
      })) as any as InstanceAttendanceType[]

      const knexClient: Knex = app.get('knexClient')

      const layerUsers = await knexClient
        .from(userAvatarPath)
        .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, '=', `${userAvatarPath}.userId`)
        .whereIn(
          `${instanceAttendancePath}.instanceId`,
          instances.map((instance) => instance.instanceId)
        )
        .whereNot(`${userAvatarPath}.userId`, userId)
        .select()
        .options({ nestTables: true })

      const targetIds = _.uniq(layerUsers.map((item) => item[userAvatarPath].userId))

      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(data)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}

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
  UserID,
  userMethods,
  userPath,
  UserPublicPatch,
  UserType
} from '@ir-engine/common/src/schemas/user/user.schema'

import { AuthenticationResult } from '@feathersjs/authentication'
import { avatarPath, identityProviderPath, userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import { Application, HookContext } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { UserService } from './user.class'
import userDocs from './user.docs'
import hooks from './user.hooks'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [userPath]: UserService
  }
}

export default (app: Application): void => {
  const options = {
    name: userPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userPath, new UserService(options), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userDocs
  })

  const service = app.service(userPath)
  service.hooks(hooks)

  // when seeding db, no need to patch users
  if (config.db.forceRefresh) return

  /**
   * This method find all users
   * @returns users
   */
  service.publish('patched', async (data: UserType, context: HookContext) => {
    try {
      const userID = data.id
      const dataToSend = {
        id: data.id,
        name: data.name
      } as UserPublicPatch

      const instances = (await app.service(instanceAttendancePath).find({
        query: {
          userId: userID,
          ended: false
        },
        headers: context.params.headers,
        paginate: false
      })) as any as InstanceAttendanceType[]

      const knexClient: Knex = app.get('knexClient')

      const layerUsers = await knexClient
        .from(userPath)
        .join(instanceAttendancePath, `${instanceAttendancePath}.userId`, '=', `${userPath}.id`)
        .whereIn(
          `${instanceAttendancePath}.instanceId`,
          instances.map((instance) => instance.instanceId)
        )
        .whereNot(`${userPath}.id`, userID)
        .select()
        .options({ nestTables: true })

      const targetIds = _.uniq(layerUsers.map((item) => item.user.id))

      return Promise.all(targetIds.map((userId: UserID) => app.channel(`userIds/${userId}`).send(dataToSend)))
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /** Always ensure all users have an avatar assigned, in case the one they have gets removed */
  app.on('login', async (authenticationResult: AuthenticationResult, params, context) => {
    const userId = authenticationResult[identityProviderPath].userId
    if (!userId) return

    const avatar = await app.service(userAvatarPath).find({ query: { userId } })
    if (avatar.data.length) return

    const avatars = await app.service(avatarPath).find({
      query: {
        isPublic: true
      }
    })

    if (!avatars.data.length) throw new Error('No avatars found in database')

    const randomReplacementAvatar = avatars.data[Math.floor(Math.random() * avatars.data.length)]
    await app.service(userAvatarPath).patch(null, { avatarId: randomReplacementAvatar.id }, { query: { userId } })
  })
}

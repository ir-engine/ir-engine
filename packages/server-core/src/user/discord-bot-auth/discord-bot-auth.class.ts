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

import { errors } from '@feathersjs/errors'
import { Paginated, ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import fetch from 'node-fetch'

import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserID, userPath, UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'

export class DiscordBotAuthService implements ServiceInterface<UserType, KnexAdapterParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async find(params?: KnexAdapterParams) {
    const url = `https://discord.com/api/users/@me`
    try {
      const authResponse = await fetch(url, {
        headers: {
          Authorization: `Bot ${params!.query!.bot_token}`
        }
      })
      const resData = JSON.parse(Buffer.from(await authResponse.arrayBuffer()).toString())
      if (!resData?.bot) throw new Error('The authenticated Discord user is not a bot')
      const token = `discord:::${resData.id}`
      const ipResult = (await this.app.service(identityProviderPath).find({
        query: {
          token: token,
          type: 'discord'
        }
      })) as Paginated<IdentityProviderType>
      if (ipResult.total > 0) {
        return this.app.service(userPath).get(ipResult.data[0].userId)
      } else {
        const ipCreation = await this.app.service(identityProviderPath).create({
          token: token,
          type: 'discord',
          userId: '' as UserID
        })
        return this.app.service(userPath).get(ipCreation.userId)
      }
    } catch (err) {
      logger.error(err)
      if (errors[err.response.status]) {
        throw new errors[err.response.status]()
      } else {
        throw new Error(err)
      }
    }
  }
}

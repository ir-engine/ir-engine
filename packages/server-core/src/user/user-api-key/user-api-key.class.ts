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

import type { NullableId, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import {
  UserApiKeyData,
  UserApiKeyPatch,
  UserApiKeyQuery,
  UserApiKeyType
} from '@etherealengine/engine/src/schemas/user/user-api-key.schema'

import { Application } from '../../../declarations'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface UserApiKeyParams extends KnexAdapterParams<UserApiKeyQuery> {
  user?: UserInterface
}

/**
 * A class for UserApiKey service
 */

export class UserApiKeyService<T = UserApiKeyType, ServiceParams extends Params = UserApiKeyParams> extends KnexAdapter<
  UserApiKeyType,
  UserApiKeyData,
  UserApiKeyParams,
  UserApiKeyPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: UserApiKeyParams) {
    return await super._find(params)
  }

  async create(data: UserApiKeyData, params?: UserApiKeyParams) {
    return super._create(data, params)
  }

  async patch(id: NullableId, data: UserApiKeyPatch, params?: UserApiKeyParams) {
    const loggedInUser = params!.user
    if (
      loggedInUser &&
      loggedInUser.scopes &&
      loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
      id != null &&
      params
    )
      return super._patch(id, { ...data })

    const userApiKey = await super._find({
      query: {
        userId: loggedInUser?.id
      }
    })

    let returned
    if (userApiKey.data.length > 0) {
      const patchData: UserApiKeyPatch = { token: data.token }
      returned = await super._patch(userApiKey.data[0].id, patchData)
    } else {
      const patchData: UserApiKeyData = { ...data, userId: loggedInUser?.id }
      returned = await super._create(patchData)
    }
    return returned
  }

  async remove(id: NullableId, _params?: UserApiKeyParams) {
    return super._remove(id, _params)
  }
}

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

import { NullableId } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { v1 } from 'uuid'

import { UserApiKeyInterface } from '@etherealengine/common/src/dbmodels/UserApiKey'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import { UserParams } from '../user/user.class'

export type UserApiKeyDataType = UserApiKeyInterface & { userId: string }
/**
 * This class used to find user-api-keys
 * and returns founded user-api-keys
 */
export class UserApiKey<T = UserApiKeyDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async patch(id: NullableId, data: any, params: UserParams = {}): Promise<T | T[]> {
    const loggedInUser = params.user as UserInterface
    if (
      loggedInUser.scopes &&
      loggedInUser.scopes.find((scope) => scope.type === 'admin:admin') &&
      id != null &&
      params
    )
      return super.patch(id, { ...data })
    const userApiKey = await this.app.service('user-api-key').Model.findOne({
      where: {
        userId: loggedInUser.id
      }
    })
    let returned
    if (userApiKey) {
      const patchData: any = { token: v1() }
      returned = await super.patch(userApiKey.id, { ...patchData })
    } else {
      const patchData: any = { userId: loggedInUser.id }
      returned = await super.create({ ...patchData })
    }
    return returned
  }
}

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

import crypto from 'crypto'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import moment from 'moment'

import { LoginTokenInterface } from '@etherealengine/common/src/dbmodels/LoginToken'

import { Application } from '../../../declarations'
import config from '../../appconfig'

export type LoginTokenDataType = LoginTokenInterface & { identityProviderId: string }
/**
 * A class for Login Token service
 */

export class LoginToken<T = LoginTokenDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * A function which is used to create login token
   *
   * @param data with identityProviderId in it
   * @returns {@Object} contains token
   */
  async create(data: any): Promise<T> {
    const { identityProviderId } = data
    const token = crypto.randomBytes(config.authentication.bearerToken.numBytes).toString('hex')
    const tokenData: any = {
      identityProviderId: identityProviderId,
      token: token,
      expiresAt: moment().utc().add(2, 'days').toDate()
    }
    return (await super.create({ ...tokenData }, {})) as T
  }
}

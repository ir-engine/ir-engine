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

import { Paginated, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'
import crypto from 'crypto'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { serverSettingPath, ServerSettingType } from '@etherealengine/engine/src/schemas/setting/server-setting.schema'
import { githubRepoAccessRefreshPath } from '@etherealengine/engine/src/schemas/user/github-repo-access-refresh.schema'

import { Application } from '../../../declarations'
import { UnauthorizedException } from '../../util/exceptions/exception'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GithubRepoAccessWebhookParams extends KnexAdapterParams {
  user: UserInterface
}

/**
 * A class for Github Repo Access Webhook service
 */
export class GithubRepoAccessWebhookService<
  T = {},
  ServiceParams extends Params = GithubRepoAccessWebhookParams
> extends KnexAdapter<T, T, GithubRepoAccessWebhookParams, T> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async create(data, params) {
    const SIG_HEADER_NAME = 'x-hub-signature-256'
    const SIG_HASH_ALGORITHM = 'sha256'
    try {
      const secret = ((await this.app.service(serverSettingPath).find()) as Paginated<ServerSettingType>).data[0]
        .githubWebhookSecret
      const sig = Buffer.from(params.headers[SIG_HEADER_NAME] || '', 'utf8')
      const hmac = crypto.createHmac(SIG_HASH_ALGORITHM, secret)
      const digest = Buffer.from(SIG_HASH_ALGORITHM + '=' + hmac.update(JSON.stringify(data)).digest('hex'), 'utf8')
      if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
        throw new UnauthorizedException('Invalid secret')
      }
      const { blocked_user, member, membership } = data
      const ghUser = member
        ? member.login
        : membership
        ? membership.user.login
        : blocked_user
        ? blocked_user.login
        : null
      if (!ghUser) return ''
      const githubIdentityProvider = await this.app.service('identity-provider').Model.findOne({
        where: {
          type: 'github',
          accountIdentifier: ghUser
        }
      })
      if (!githubIdentityProvider) return ''
      const user = await this.app.service('user').get(githubIdentityProvider.userId)
      // GitHub's API doesn't always reflect changes to user repo permissions right when a webhook is sent.
      // 10 seconds should be more than enough time for the changes to propagate.
      setTimeout(() => {
        this.app.service(githubRepoAccessRefreshPath).find({ user })
      }, 10000)
      return ''
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}

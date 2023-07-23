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

import { Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import {
  githubRepoAccessPath,
  GithubRepoAccessType
} from '@etherealengine/engine/src/schemas/user/github-repo-access.schema'

import { Application } from '../../../declarations'
import { getUserRepos } from '../../projects/project/github-helper'
import logger from '../../ServerLogger'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GithubRepoAccessRefreshParams extends KnexAdapterParams {
  user: UserInterface
}

/**
 * A class for Github Repo Access Refresh service
 */
export class GithubRepoAccessRefreshService<
  T = {},
  ServiceParams extends Params = GithubRepoAccessRefreshParams
> extends KnexAdapter<T, T, GithubRepoAccessRefreshParams, T> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: GithubRepoAccessRefreshParams) {
    try {
      const githubIdentityProvider = await (this.app.service('identity-provider') as any).Model.findOne({
        where: {
          userId: params?.user.id,
          type: 'github'
        }
      })
      if (githubIdentityProvider) {
        const existingGithubRepoAccesses = (await this.app.service(githubRepoAccessPath).find({
          query: {
            identityProviderId: githubIdentityProvider.id
          },
          paginate: false
        })) as any as GithubRepoAccessType[]

        const githubRepos = await getUserRepos(githubIdentityProvider.oauthToken)
        await Promise.all(
          githubRepos.map(async (repo) => {
            const matchingAccess = existingGithubRepoAccesses.find((access) => access.repo === repo.html_url)
            const hasWriteAccess = repo.permissions.admin || repo.permissions.maintain || repo.permissions.push
            if (!matchingAccess)
              await this.app.service(githubRepoAccessPath).create({
                repo: repo.html_url,
                identityProviderId: githubIdentityProvider.id,
                hasWriteAccess
              })
            else
              await this.app.service(githubRepoAccessPath).patch(matchingAccess.id, {
                hasWriteAccess
              })
          })
        )
        const urlsOnly = githubRepos.map((repo) => repo.html_url)
        await Promise.all(
          existingGithubRepoAccesses.map(async (repoAccess) => {
            if (urlsOnly.indexOf(repoAccess.repo) < 0)
              await this.app.service(githubRepoAccessPath).remove(repoAccess.id)
          })
        )
      }
      return
    } catch (err) {
      logger.error(err)
      throw err
    }
  }
}

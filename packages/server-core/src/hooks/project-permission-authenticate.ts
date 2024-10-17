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

import { BadRequest, Forbidden } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import { GITHUB_URL_REGEX } from '@ir-engine/common/src/regex'
import {
  projectPermissionPath,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { projectPath, ProjectType } from '@ir-engine/common/src/schemas/projects/project.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { UserType } from '@ir-engine/common/src/schemas/user/user.schema'

import { scopePath, ScopeType } from '@ir-engine/common/src/schema.type.module'
import { Application } from '../../declarations'
import { checkUserRepoWriteStatus } from '../projects/project/github-helper'

export default (writeAccess) => {
  return async (context: HookContext<Application>) => {
    const { params, app } = context
    if (context.params.isInternal) return context
    const loggedInUser = params.user as UserType
    const isAdmin =
      (
        await app.service(scopePath).find({
          query: {
            userId: loggedInUser.id,
            type: 'admin:admin' as ScopeType
          }
        })
      ).data.length > 0
    if ((!writeAccess && isAdmin) || context.provider == null) return context
    let projectId, projectRepoPath
    const projectName = context.arguments[0]?.projectName || params.query?.projectName
    if (projectName) {
      const project = (await app.service(projectPath).find({
        query: {
          action: 'admin',
          name: projectName,
          $limit: 1
        }
      })) as Paginated<ProjectType>

      if (project.data.length > 0) {
        projectRepoPath = project.data[0].repositoryPath
        projectId = project.data[0].id
      } else throw new BadRequest('Invalid Project name')
    }
    if (!projectId) projectId = params.id || context.id
    // @ts-ignore
    const projectPermissionResult = (await app.service(projectPermissionPath).find({
      query: {
        projectId: projectId,
        userId: loggedInUser.id,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>
    if (projectPermissionResult == null) {
      const githubIdentityProvider = (await app.service(identityProviderPath).find({
        query: {
          userId: params.user.id,
          type: 'github',
          $limit: 1
        }
      })) as Paginated<IdentityProviderType>

      if (githubIdentityProvider.data.length === 0) throw new Forbidden('You are not authorized to access this project')
      const githubPathRegexExec = GITHUB_URL_REGEX.exec(projectRepoPath)
      if (!githubPathRegexExec) throw new BadRequest('Invalid project URL')
      const split = githubPathRegexExec[1].split('/')
      const owner = split[0]
      const repo = split[1]
      const userRepoWriteStatus = await checkUserRepoWriteStatus(
        owner,
        repo,
        githubIdentityProvider.data[0].oauthToken!,
        context.app
      )
      if (userRepoWriteStatus !== 200) throw new Forbidden('You are not authorized to access this project')
    }

    return context
  }
}

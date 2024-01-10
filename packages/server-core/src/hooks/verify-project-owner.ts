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

import { BadRequest, Forbidden, NotAuthenticated } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import {
  ProjectPermissionType,
  projectPermissionPath
} from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import { UserType } from '@etherealengine/common/src/schemas/user/user.schema'
import { checkScope } from '@etherealengine/engine/src/common/functions/checkScope'
import { Application } from '../../declarations'

export default () => {
  return async (context: HookContext<Application>) => {
    if (context.params.isInternal) return context
    const loggedInUser = context.params.user as UserType
    if (!loggedInUser) throw new NotAuthenticated('No logged in user')
    if (loggedInUser.scopes && (await checkScope(loggedInUser, 'projects', 'write'))) return context
    const app = context.app
    const projectId =
      context.service === 'project'
        ? context.id
        : context.id && typeof context.id === 'string'
        ? (
            (await app.service(projectPermissionPath).find({
              query: {
                id: context.id,
                $limit: 1
              }
            })) as Paginated<ProjectPermissionType>
          ).data[0].projectId
        : context.data.id || context.data.projectId
    const project = await app.service(projectPath).get(projectId)
    if (!project) throw new BadRequest('Invalid project ID')
    const projectPermission = (await app.service(projectPermissionPath).find({
      query: {
        userId: loggedInUser.id,
        projectId: projectId,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>

    if (projectPermission.data.length === 0 || projectPermission.data[0].type !== 'owner')
      throw new Forbidden('You are not an owner of this project')

    return context
  }
}

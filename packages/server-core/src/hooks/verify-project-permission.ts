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

import { BadRequest, Forbidden, NotAuthenticated, NotFound } from '@feathersjs/errors'
import { HookContext, Paginated } from '@feathersjs/feathers'

import {
  projectPermissionPath,
  ProjectPermissionType
} from '@etherealengine/common/src/schemas/projects/project-permission.schema'
import { projectPath } from '@etherealengine/common/src/schemas/projects/project.schema'
import { UserType } from '@etherealengine/common/src/schemas/user/user.schema'

import { Application } from '../../declarations'

export default (types: string[]) => {
  return async (context: HookContext<Application>) => {
    if (context.params.isInternal) return context

    const loggedInUser = context.params.user as UserType

    if (!loggedInUser) throw new NotAuthenticated('No logged in user')

    let projectId = ''
    if (context.params.query?.projectId) {
      projectId = context.params.query.projectId
    } else if (context.data?.projectId) {
      projectId = context.data.projectId
    } else if (context.id) {
      projectId = context.id.toString()
    }

    if (!projectId) throw new BadRequest('Missing project ID in request')

    const project = await context.app.service(projectPath).get(projectId)

    if (!project) throw new NotFound('Project not found')

    const { data } = (await context.app.service(projectPermissionPath).find({
      query: {
        userId: loggedInUser.id,
        projectId: projectId,
        $limit: 1
      }
    })) as Paginated<ProjectPermissionType>

    if (data.length === 0) throw new Forbidden('Project permission not found')
    if (!types.includes(data[0].type)) {
      throw new Forbidden('Missing required project permission')
    }

    return context
  }
}

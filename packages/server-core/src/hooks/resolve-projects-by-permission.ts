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

import { Forbidden } from '@feathersjs/errors'
import { ProjectType, UserType, projectPath, projectPermissionPath } from '@ir-engine/common/src/schema.type.module'
import { Application, HookContext } from '../../declarations'
/**
 * if project is not provided query the project permission table for all projects the user has permissions for.
 * Then add the projects to the $in of the query
 * @param context
 * @returns
 */
export default () => {
  return async (context: HookContext<Application>) => {
    if (!context.params.query?.project) {
      const loggedInUser = context.params.user as UserType
      const data = await context.app.service(projectPermissionPath).find({
        query: {
          userId: loggedInUser.id
        },
        paginate: false
      })

      const allowedProjects = (await context.app.service(projectPath).find({
        query: {
          $or: [{ visibility: 'public' }, { id: { $in: data.map((projectPermission) => projectPermission.projectId) } }]
        },
        paginate: false
      })) as any as ProjectType[]

      if (allowedProjects.length === 0) {
        console.error(`No Project permissions found. UserId: ${loggedInUser.id}`)
        throw new Forbidden(`Project permissions not found`)
      }

      context.params.query.project = { $in: allowedProjects.map((project) => project.name) }

      return context
    }
    return context
  }
}

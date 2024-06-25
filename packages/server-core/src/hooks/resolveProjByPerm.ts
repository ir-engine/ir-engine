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

import {
  ProjectPermissionType,
  UserType,
  projectPath,
  projectPermissionPath
} from '@etherealengine/common/src/schema.type.module'
import { Paginated } from '@feathersjs/feathers'
import { Application, HookContext } from '../../declarations'
/**
 * if project is not provided query the project permission table for all projects the user has permissions for.
 * Then add the projects to the $or of the query
 * @param context
 * @returns
 */
export default () => {
  return async (context: HookContext<Application>) => {
    if (!context.params.query?.project) {
      const loggedInUser = context.params.user as UserType
      const { data } = (await context.app.service(projectPermissionPath).find({
        query: {
          userId: loggedInUser.id,
          $limit: 1000 //idk what's a good number
        }
      })) as Paginated<ProjectPermissionType>
      console.log(loggedInUser.id)
      console.log(data)

      for (const projP of data) {
        if (!context.params.query?.$or) {
          context.params.query.$or = []
        }
        const project = await context.app.service(projectPath).get(projP.projectId)
        console.log(project)
        if (project !== undefined) context.params.query?.$or?.push({ project: project.name })
      }
      context.params.query?.$or?.push({ project: 'default-project' })
      return context
    }
    return context
  }
}

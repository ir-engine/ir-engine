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

import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import { ProjectType, projectPath } from '@ir-engine/common/src/schemas/projects/project.schema'
import { Application, HookContext } from '../../declarations'
/**
 * resolve project id from name in query
 * @param context
 * @returns
 */
export default () => {
  return async (context: HookContext<Application>) => {
    if (!context.params.query?.project && !context.data?.project) {
      return context
    }

    const projectName: string = context.params.query.project || context.data.project

    const projectResult = (await context.app.service(projectPath).find({
      query: { name: projectName, $limit: 1 }
    })) as Paginated<ProjectType>

    if (projectResult.data.length === 0) {
      throw new BadRequest(`No project named ${projectName} exists`)
    }
    context.params.query.projectId = projectResult.data[0].id
    return context
  }
}

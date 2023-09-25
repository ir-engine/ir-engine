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

import { Application } from '../../../declarations'

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { SceneDataQuery, SceneDataServiceType } from '@etherealengine/engine/src/schemas/projects/scene-data.schema'
import { SceneDataType } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { NullableId, Paginated, Params, ServiceInterface } from '@feathersjs/feathers'
import { getScenesForProject } from './scene-data-helper'

export interface SceneDataParams extends Params, SceneDataQuery {
  paginate?: false
}

export class SceneDataService
  implements ServiceInterface<SceneDataServiceType | SceneDataType | Paginated<SceneDataType>, SceneDataParams>
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async get(id: NullableId, params?: SceneDataParams) {
    return getScenesForProject(this.app, params)
  }

  async find(params?: SceneDataParams) {
    const paginate = params?.paginate === false || params?.query?.paginate === false ? false : undefined
    delete params?.paginate
    delete params?.query?.paginate

    const projects = (await this.app.service(projectPath).find({ ...params, paginate: false })) as ProjectType[]
    const scenes = await Promise.all(
      projects.map(
        (project) =>
          new Promise<SceneDataType[]>(async (resolve) => {
            const projectScenes = (
              await getScenesForProject(this.app, {
                ...params,
                query: {
                  ...params?.query,
                  projectName: project.name,
                  metadataOnly: params?.metadataOnly,
                  internal: params?.provider == null
                }
              })
            ).data
            projectScenes.forEach((scene) => (scene.project = project.name))
            resolve(projectScenes)
          })
      )
    )

    return paginate === false ? scenes.flat() : { total: scenes.flat().length, limit: 0, skip: 0, data: scenes.flat() }
  }
}

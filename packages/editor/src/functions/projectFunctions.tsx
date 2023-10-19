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

import { API } from '@etherealengine/client-core/src/API'
import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { Paginated } from '@feathersjs/feathers'
import { EditorHistoryAction } from '../services/EditorHistory'
import { EditorControlFunctions } from './EditorControlFunctions'

/**
 * Gets a list of projects installed
 * @returns {ProjectType[]}
 */
export const getProjects = async (): Promise<ProjectType[]> => {
  try {
    const projects = (await API.instance.client.service(projectPath).find({
      query: { allowed: true }
    })) as Paginated<ProjectType>
    return projects.data
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Loads scene from provided project file.
 */
export async function loadProjectScene(projectData: SceneData) {
  EditorControlFunctions.replaceSelection([])

  dispatchAction(EditorHistoryAction.clearHistory({}))

  getMutableState(SceneState).sceneData.set(projectData)
}

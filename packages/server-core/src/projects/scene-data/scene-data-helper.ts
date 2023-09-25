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

import { ProjectType, projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { SceneDataType } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application, Paginated } from '@feathersjs/feathers'
import logger from '../../ServerLogger'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getSceneData } from '../scene/scene-helper'
import { SceneDataParams } from './scene-data.class'

export const getScenesForProject = async (app: Application, params?: SceneDataParams) => {
  const storageProvider = getStorageProvider(params?.query?.storageProviderName)
  const projectName = params?.projectName
  const metadataOnly = params?.metadataOnly
  const internal = params?.internal
  try {
    const project = (await app
      .service(projectPath)
      .find({ ...params, query: { name: projectName, $limit: 1 } })) as Paginated<ProjectType>
    if (project.data.length === 0) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = `projects/${projectName}/`

    const fileResults = await storageProvider.listObjects(newSceneJsonPath, false)
    const files = fileResults.Contents.map((dirent) => dirent.Key)
      .filter((name) => name.endsWith('.scene.json'))
      .map((name) => name.slice(0, -'.scene.json'.length))

    const sceneData: SceneDataType[] = await Promise.all(
      files.map(async (sceneName) =>
        getSceneData(projectName!, sceneName.replace(newSceneJsonPath, ''), metadataOnly, internal)
      )
    )

    return { data: sceneData }
  } catch (e) {
    logger.error(e)
    return { data: [] as SceneDataType[] }
  }
}

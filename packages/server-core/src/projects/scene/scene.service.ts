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
import Multer from '@koa/multer'

import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getState } from '@etherealengine/hyperflux'

import { instanceActivePath } from '@etherealengine/engine/src/schemas/networking/instance-active.schema'
import {
  InstanceAttendanceType,
  instanceAttendancePath
} from '@etherealengine/engine/src/schemas/networking/instance-attendance.schema'
import { projectPath } from '@etherealengine/engine/src/schemas/projects/project.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getSceneData } from './scene-helper'
import { SceneService } from './scene.class'
import projectDocs from './scene.docs'
import hooks from './scene.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    scene: SceneService
  }
}

export interface SceneParams extends Params {
  metadataOnly: boolean
}

type GetScenesArgsType = {
  projectName: string
  metadataOnly: boolean
  internal?: boolean
  storageProviderName?: string
}

export const getScenesForProject = (app: Application) => {
  return async function (args: GetScenesArgsType, params?: Params): Promise<{ data: SceneData[] }> {
    const storageProvider = getStorageProvider(args.storageProviderName)
    const { projectName, metadataOnly, internal } = args
    try {
      const project = await app.service(projectPath).find({ ...params, query: { name: projectName } })
      if (!project || !project.data) throw new Error(`No project named ${projectName} exists`)

      const newSceneJsonPath = `projects/${projectName}/`

      const fileResults = await storageProvider.listObjects(newSceneJsonPath, false)
      const files = fileResults.Contents.map((dirent) => dirent.Key)
        .filter((name) => name.endsWith('.scene.json'))
        .map((name) => name.slice(0, -'.scene.json'.length))

      const sceneData: SceneData[] = await Promise.all(
        files.map(async (sceneName) =>
          getSceneData(projectName, sceneName.replace(newSceneJsonPath, ''), metadataOnly, internal)
        )
      )

      return {
        data: sceneData
      }
    } catch (e) {
      logger.error(e)
      return { data: [] }
    }
  }
}

export const getAllScenes = (app: Application) => {
  return async function (params: SceneParams): Promise<{ data: SceneData[] }> {
    const projects = await app.service(projectPath).find(params)
    const scenes = await Promise.all(
      projects.data.map(
        (project) =>
          new Promise<SceneData[]>(async (resolve) => {
            const projectScenes = (
              await getScenesForProject(app)(
                { projectName: project.name, metadataOnly: params.metadataOnly, internal: params.provider == null },
                params
              )
            ).data
            projectScenes.forEach((scene) => (scene.project = project.name))
            resolve(projectScenes)
          })
      )
    )
    return {
      data: scenes.flat()
    }
  }
}

const multipartMiddleware = Multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application) => {
  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Scene(app)
  event.docs = projectDocs
  app.use('scene', event)

  /**
   * Get our initialized service so that we can register hooks
   */

  const service = app.service('scene')

  service.hooks(hooks)

  if (getState(ServerState).serverMode === ServerMode.API)
    service.publish('updated', async (data, context) => {
      const instanceActive = await app.service(instanceActivePath).find({
        query: { sceneId: data.sceneId }
      })

      const instanceAttendances = (await app.service(instanceAttendancePath)._find({
        query: {
          instanceId: {
            $in: instanceActive.map((item) => item.id)
          },
          ended: false
        },
        paginate: false
      })) as InstanceAttendanceType[]

      return Promise.all(
        instanceAttendances.map((instanceAttendance) => {
          return app.channel(`userIds/${instanceAttendance.userId}`).send({})
        })
      )
    })
}

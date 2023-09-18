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
import { scenePath } from '@etherealengine/engine/src/schemas/projects/scene.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { UploadParams } from '../../media/upload-asset/upload-asset.service'
import { getSceneData } from './scene-helper'
import { SceneService } from './scene.class'
import projectDocs from './scene.docs'
import hooks from './scene.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    scene: SceneService
    'scene/upload': {
      create: ReturnType<typeof uploadScene>
    }
  }
  interface ServiceTypes {
    'scene-data': {
      get: ReturnType<typeof getScenesForProject>
      find: ReturnType<typeof getAllScenes>
    }
  }
}

export const uploadScene = (app: Application) => async (data: any, params: UploadParams) => {
  if (typeof data === 'string') data = JSON.parse(data)
  if (typeof data.sceneData === 'string') data.sceneData = JSON.parse(data.sceneData)

  const thumbnailBuffer = params.files.length > 0 ? (params.files[0].buffer as Buffer) : undefined

  const { projectName, sceneName, sceneData, storageProviderName } = data

  const result = await app
    .service(scenePath)
    .update(null, { sceneName, sceneData, storageProviderName, thumbnailBuffer, projectName })

  // Clear params otherwise all the files and auth details send back to client as response
  for (const prop of Object.getOwnPropertyNames(params)) delete params[prop]

  return result
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
  app.use(
    'scene/upload',
    {
      create: uploadScene(app)
    },
    {
      koa: {
        before: [
          multipartMiddleware.any(),
          async (ctx, next) => {
            console.log('trying to upload scene')
            const files = ctx.request.files
            if (ctx?.feathers && ctx.method !== 'GET') {
              ;(ctx as any).feathers.files = (ctx as any).request.files.media
                ? (ctx as any).request.files.media
                : ctx.request.files
            }
            if (Object.keys(files as any).length > 1) {
              ctx.status = 400
              ctx.body = 'Only one scene is allowed'
              return
            }
            await next()
            console.log('uploaded scene')
            return ctx.body
          }
        ]
      }
    }
  )

  app.use('scene-data', {
    get: getScenesForProject(app),
    find: getAllScenes(app)
  })

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

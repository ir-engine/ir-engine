import { Params } from '@feathersjs/feathers'
import express from 'express'
import multer from 'multer'

import { SceneData } from '@etherealengine/common/src/interfaces/SceneInterface'
import { getState } from '@etherealengine/hyperflux'

import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { UploadParams } from '../../media/upload-asset/upload-asset.service'
import { getActiveInstancesForScene } from '../../networking/instance/instance.service'
import logger from '../../ServerLogger'
import { ServerMode, ServerState } from '../../ServerState'
import { getAllPortals, getEnvMapBake, getPortal } from './scene-helper'
import { getSceneData, Scene } from './scene.class'
import projectDocs from './scene.docs'
import hooks from './scene.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    scene: Scene
    'scene/upload': {
      create: ReturnType<typeof uploadScene>
    }
  }
  interface ServiceTypes {
    portal: {
      get: ReturnType<typeof getPortal>
      find: ReturnType<typeof getAllPortals>
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

  const thumbnailBuffer = params.files.length > 0 ? params.files[0].buffer : undefined

  const { projectName, sceneName, sceneData, storageProviderName } = data

  const result = await app
    .service('scene')
    .update(projectName, { sceneName, sceneData, storageProviderName, thumbnailBuffer })

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
      const project = await app.service('project').get(projectName, params)
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
    const projects = await app.service('project').find(params)
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

const multipartMiddleware = multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application) => {
  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Scene(app)
  event.docs = projectDocs

  app.use('scene', event)

  app.use(
    'scene/upload',
    multipartMiddleware.any(),
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
      if (req?.feathers && req.method !== 'GET') {
        ;(req as any).feathers.files = (req as any).files.media ? (req as any).files.media : (req as any).files
      }

      next()
    },
    {
      create: uploadScene(app)
    }
  )

  app.use('scene-data', {
    get: getScenesForProject(app),
    find: getAllScenes(app)
  })

  app.use('portal', {
    get: getPortal(app),
    find: getAllPortals(app)
  })
  app.use('/cubemap/:entityId', getEnvMapBake(app))

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('scene')

  service.hooks(hooks)

  if (getState(ServerState).serverMode === ServerMode.API)
    service.publish('updated', async (data, context) => {
      const instances = await getActiveInstancesForScene(app)({ query: { sceneId: data.sceneId } })
      const users = (
        await Promise.all(
          instances.map((instance) =>
            app.service('user').Model.findAll({
              where: {
                instanceId: instance.id
              }
            })
          )
        )
      ).flat()
      const targetIds = users.map((user) => user.id)
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({})
        })
      )
    })
}

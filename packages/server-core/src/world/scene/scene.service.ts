import { Params } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'

import { Application } from '../../../declarations'
import { getAllPortals, getCubemapBake, getPortal } from './scene-helper'
import { Scene, getSceneData } from './scene.class'
import projectDocs from './scene.docs'
import hooks from './scene.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    scene: Scene
  }
  interface ServiceTypes {
    scenes: {
      get: ReturnType<typeof getScenesForProject>
      find: ReturnType<typeof getAllScenes>
    }
  }
}

export const getScenesForProject = (app: Application) => {
  return async function ({ projectName, metadataOnly }, params: Params): Promise<{ data: SceneDetailInterface[] }> {
    try {
      const project = await app.service('project').get(projectName, params)
      if (!project || !project.data) throw new Error(`No project named ${projectName} exists`)

      const newSceneJsonPath = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}`)

      const files = fs
        .readdirSync(newSceneJsonPath, { withFileTypes: true })
        .filter((dirent) => !dirent.isDirectory())
        .map((dirent) => dirent.name)
        .filter((name) => name.endsWith('.scene.json'))
        .map((name) => name.slice(0, -'.scene.json'.length))

      const sceneData: SceneDetailInterface[] = files.map((sceneName) =>
        getSceneData(projectName, sceneName, metadataOnly)
      )

      return {
        data: sceneData
      }
    } catch (e) {
      console.log(e)
      return null!
    }
  }
}

export const getAllScenes = (app: Application) => {
  return async function (params: Params): Promise<{ data: SceneDetailInterface[] }> {
    const projects = await app.service('project').find(params)
    const scenes = await Promise.all(
      projects.data.map(
        (project) =>
          new Promise<SceneDetailInterface[]>(async (resolve) => {
            const projectScenes = (
              await getScenesForProject(app)({ projectName: project.name, metadataOnly: params.metadataOnly }, params)
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

export default (app: Application) => {
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Scene(app)
  event.docs = projectDocs

  app.use('scene', event)

  app.use('scenes', {
    get: getScenesForProject(app),
    find: getAllScenes(app)
  })

  app.use('portal', {
    get: getPortal(app),
    find: getAllPortals(app)
  })
  app.use('/cubemap/:entityId', getCubemapBake(app))

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('scene')

  service.hooks(hooks)
}

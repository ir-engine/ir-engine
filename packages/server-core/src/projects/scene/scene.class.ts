import { NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { SceneData, SceneJson, SceneMetadata } from '@xrengine/common/src/interfaces/SceneInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'
import defaultSceneSeed from '@xrengine/projects/default-project/default.scene.json'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { cleanString } from '../../util/cleanString'
import { uploadLocalProjectToProvider } from '../project/project.class'
import { cleanSceneDataCacheURLs, parseSceneDataCacheURLs } from './scene-parser'

const storageProvider = useStorageProvider()
const NEW_SCENE_NAME = 'New-Scene'

export const getSceneData = (projectName, sceneName, metadataOnly, internal) => {
  const newSceneJsonPath = path.resolve(
    appRootPath.path,
    `packages/projects/projects/${projectName}/${sceneName}.scene.json`
  )

  if (!fs.existsSync(newSceneJsonPath)) throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)

  const sceneThumbnailPath = getCachedAsset(
    `projects/${projectName}/${sceneName}.thumbnail.jpeg`,
    storageProvider.cacheDomain,
    internal
  )

  const sceneData: SceneData = {
    name: sceneName,
    project: projectName,
    thumbnailUrl: sceneThumbnailPath + `?${Date.now()}`,
    scene: metadataOnly
      ? undefined!
      : parseSceneDataCacheURLs(
          JSON.parse(fs.readFileSync(path.resolve(newSceneJsonPath), 'utf8')),
          storageProvider.cacheDomain,
          internal
        )
  }

  return sceneData
}

interface UpdateParams {
  sceneName: string
  sceneData?: SceneJson
  thumbnailBuffer?: ArrayBuffer | Buffer // ArrayBuffer on client, Buffer on server
}

interface RenameParams {
  newSceneName: string
  oldSceneName: string
  projectName: string
}

export class Scene implements ServiceMethods<any> {
  app: Application
  docs: any

  constructor(app: Application) {
    this.app = app
  }

  async setup() {}

  async find(params?: Params): Promise<{ data: SceneData[] }> {
    const projects = await this.app.service('project').find(params)

    const scenes: SceneData[] = []
    for (const project of projects.data) {
      const { data } = await this.app
        .service('scenes')
        .get({ projectName: project.name, metadataOnly: true, internal: true }, params!)
      scenes.push(
        ...data.map((d) => {
          d.project = project.name
          return d
        })
      )
    }

    for (let [index, _] of scenes.entries()) {
      scenes[index].thumbnailUrl += `?${Date.now()}`
    }

    return { data: scenes }
  }

  // @ts-ignore
  async get({ projectName, sceneName, metadataOnly }, params?: Params): Promise<{ data: SceneData }> {
    const project = await this.app.service('project').get(projectName, params)
    if (!project?.data) throw new Error(`No project named ${projectName} exists`)

    const sceneData = getSceneData(projectName, sceneName, metadataOnly, params!.provider == null)

    return {
      data: sceneData
    }
  }

  async create(data: any, params?: Params): Promise<any> {
    const { projectName } = data
    logger.info('[scene.create]: ' + projectName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const projectPath = path.resolve(appRootPath.path, 'packages/projects/projects/' + projectName) + '/'

    let newSceneName = NEW_SCENE_NAME
    let counter = 1

    while (true) {
      if (counter > 1) newSceneName = NEW_SCENE_NAME + '-' + counter
      if (!fs.existsSync(projectPath + newSceneName + '.scene.json')) break

      counter++
    }

    fs.copyFileSync(
      path.resolve(appRootPath.path, `packages/projects/default-project/default.thumbnail.jpeg`),
      path.resolve(projectPath + newSceneName + '.thumbnail.jpeg')
    )

    fs.copyFileSync(
      path.resolve(appRootPath.path, `packages/projects/default-project/default.scene.json`),
      path.resolve(projectPath + newSceneName + '.scene.json')
    )

    /**
     * For local development flow only
     * Updates the local storage provider with the project's current files
     */
    if (isDev) {
      await uploadLocalProjectToProvider(projectName)
    }

    return { projectName, sceneName: newSceneName }
  }

  async patch(id: NullableId, data: RenameParams, params?: Params): Promise<any> {
    const { newSceneName, oldSceneName, projectName } = data

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const oldSceneJsonPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${oldSceneName}.scene.json`
    )

    const oldSceneThumbNailPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${oldSceneName}.thumbnail.jpeg`
    )

    if (fs.existsSync(oldSceneJsonPath)) {
      const newSceneJsonPath = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${newSceneName}.scene.json`
      )
      fs.renameSync(oldSceneJsonPath, newSceneJsonPath)
    }

    if (fs.existsSync(oldSceneThumbNailPath)) {
      const newSceneThumbNailPath = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${newSceneName}.thumbnail.jpeg`
      )
      fs.renameSync(oldSceneThumbNailPath, newSceneThumbNailPath)
    }

    return
  }

  async update(projectName: string, data: UpdateParams, params?: Params): Promise<any> {
    const { sceneName, sceneData, thumbnailBuffer } = data
    logger.info('[scene.update]: ', { projectName, data })

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${sceneName}.scene.json`
    )

    if (thumbnailBuffer) {
      const sceneThumbnailPath = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${sceneName}.thumbnail.jpeg`
      )
      fs.writeFileSync(path.resolve(sceneThumbnailPath), thumbnailBuffer as Buffer)
    }

    fs.writeFileSync(
      path.resolve(newSceneJsonPath),
      JSON.stringify(cleanSceneDataCacheURLs(sceneData ?? defaultSceneSeed, storageProvider.cacheDomain), null, 2)
    )

    /**
     * For local development flow only
     * Updates the local storage provider with the project's current files
     */
    if (isDev) {
      await uploadLocalProjectToProvider(projectName)
    }
  }

  // async patch(sceneId: NullableId, data: PatchData, params: Params): Promise<SceneDetailInterface> {}

  // @ts-ignore
  async remove({ projectName, sceneName }, params?: Params): Promise<any> {
    const name = cleanString(sceneName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const sceneJsonPath = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/${name}.scene.json`)
    const thumbnailPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${name}.thumbnail.jpeg`
    )
    if (fs.existsSync(sceneJsonPath)) {
      fs.rmSync(path.resolve(sceneJsonPath))
    }

    if (fs.existsSync(thumbnailPath)) {
      fs.rmSync(path.resolve(thumbnailPath))
    }
  }
}

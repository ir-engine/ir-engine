import { Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { SceneDetailInterface, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import fs from 'fs'
import path from 'path'
import appRootPath from 'app-root-path'
import { cleanString } from '../../util/cleanString'
import { uploadLocalProjectToProvider } from '../project/project.class'
import { isDev } from '@xrengine/common/src/utils/isDev'
import defaultSceneSeed from '@xrengine/projects/default-project/empty.scene.json'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
import { cleanSceneDataCacheURLs, parseSceneDataCacheURLs } from './scene-parser'

const storageProvider = useStorageProvider()
const NEW_SCENE_NAME = 'New-Scene'

export const getSceneData = (projectName, sceneName, metadataOnly) => {
  const newSceneJsonPath = path.resolve(
    appRootPath.path,
    `packages/projects/projects/${projectName}/${sceneName}.scene.json`
  )

  if (!fs.existsSync(newSceneJsonPath)) throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)

  const sceneThumbnailPath = getCachedAsset(
    `projects/${projectName}/${sceneName}.thumbnail.jpeg`,
    storageProvider.cacheDomain
  )

  const sceneData: SceneDetailInterface = {
    name: sceneName,
    thumbnailUrl: sceneThumbnailPath + `?${Date.now()}`,
    scene: metadataOnly
      ? undefined
      : parseSceneDataCacheURLs(
          JSON.parse(fs.readFileSync(path.resolve(newSceneJsonPath), 'utf8')),
          storageProvider.cacheDomain
        )
  }

  return sceneData
}

interface UpdateParams {
  sceneName: string
  sceneData?: SceneJson
  thumbnailBuffer?: Buffer
  rename?: boolean
  oldSceneName?: string
}

export class Scene implements ServiceMethods<any> {
  app: Application
  docs: any

  constructor(app: Application) {
    this.app = app
  }

  async setup() {}

  async find(params): Promise<{ data: SceneDetailInterface[] }> {
    const projects = await this.app.service('project').find(params)

    const scenes: SceneDetailInterface[] = []
    for (const project of projects.data) {
      const { data } = await this.app.service('scenes').get({ projectName: project.name, metadataOnly: true }, params)
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

    return {
      data: scenes
    }
  }

  // @ts-ignore
  async get({ projectName, sceneName, metadataOnly }, params: Params): Promise<{ data: SceneDetailInterface }> {
    const project = await this.app.service('project').get(projectName, params)
    if (!project?.data) throw new Error(`No project named ${projectName} exists`)

    const sceneData = getSceneData(projectName, sceneName, metadataOnly)

    return {
      data: sceneData
    }
  }

  async create(data: any, params: any): Promise<any> {
    const { projectName } = data
    console.log('[scene.create]:', projectName)

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
      path.resolve(appRootPath.path, `packages/projects/default-project/empty.thumbnail.jpeg`),
      path.resolve(projectPath + newSceneName + '.thumbnail.jpeg')
    )

    fs.copyFileSync(
      path.resolve(appRootPath.path, `packages/projects/default-project/empty.scene.json`),
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

  async update(projectName: string, data: UpdateParams, params: Params): Promise<any> {
    const { sceneName, sceneData, thumbnailBuffer, rename, oldSceneName } = data
    console.log('[scene.update]:', projectName, data)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${sceneName}.scene.json`
    )
    if (rename) {
      const oldSceneJsonPath = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${oldSceneName}.scene.json`
      )
      const oldSceneThumbnailPath = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${oldSceneName}.thumbnail.jpeg`
      )
      if (fs.existsSync(oldSceneJsonPath)) {
        fs.renameSync(oldSceneJsonPath, newSceneJsonPath)
      }
      if (fs.existsSync(oldSceneThumbnailPath)) {
        const newSceneThumbnailPath = path.resolve(
          appRootPath.path,
          `packages/projects/projects/${projectName}/${sceneName}.thumbnail.jpeg`
        )
        fs.renameSync(oldSceneThumbnailPath, newSceneThumbnailPath)
      }
      return
    }

    if (thumbnailBuffer) {
      const sceneThumbnailPath = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${sceneName}.thumbnail.jpeg`
      )
      fs.writeFileSync(path.resolve(sceneThumbnailPath), thumbnailBuffer)
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
  async remove({ projectName, sceneName }, params: Params): Promise<any> {
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

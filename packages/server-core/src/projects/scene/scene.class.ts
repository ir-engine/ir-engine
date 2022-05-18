import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { SceneData, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'
import defaultSceneSeed from '@xrengine/projects/default-project/default.scene.json'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { cleanString } from '../../util/cleanString'
import { cleanSceneDataCacheURLs, parseSceneDataCacheURLs } from './scene-parser'

const NEW_SCENE_NAME = 'New-Scene'

export const getSceneData = async (projectName, sceneName, metadataOnly, internal, downloadIfNotPresent = false) => {
  const storageProvider = getStorageProvider()
  const scenePath = `projects/${projectName}/${sceneName}.scene.json`
  const thumbnailPath = `projects/${projectName}/${sceneName}.thumbnail.jpeg`

  const thumbnailUrl = getCachedAsset(thumbnailPath, storageProvider.cacheDomain, internal)

  const sceneExists = await storageProvider.doesExist(`${sceneName}.scene.json`, `projects/${projectName}/`)
  if (sceneExists) {
    const sceneResult = await storageProvider.getObject(scenePath)
    const sceneData: SceneData = {
      name: sceneName,
      project: projectName,
      thumbnailUrl: thumbnailUrl + `?${Date.now()}`,
      scene: metadataOnly
        ? undefined!
        : parseSceneDataCacheURLs(JSON.parse(sceneResult.Body.toString()), storageProvider.cacheDomain, internal)
    }
    return sceneData
  }
  throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)
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
        .service('scene-data')
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

    const sceneData = await getSceneData(projectName, sceneName, metadataOnly, params!.provider == null)

    return {
      data: sceneData
    }
  }

  async create(data: any, params?: Params): Promise<any> {
    const { projectName } = data
    logger.info('[scene.create]: ' + projectName)

    const storageProvider = getStorageProvider()

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const projectPath = `projects/${projectName}/`

    let newSceneName = NEW_SCENE_NAME
    let counter = 1

    while (true) {
      if (counter > 1) newSceneName = NEW_SCENE_NAME + '-' + counter
      if (!(await storageProvider.doesExist(`${newSceneName}.scene.json`, projectPath))) break

      counter++
    }

    await storageProvider.moveObject(
      `default.thumbnail.jpeg`,
      `${newSceneName}.thumbnail.jpeg`,
      `projects/default-project`,
      projectPath,
      true
    )
    await storageProvider.moveObject(
      `default.scene.json`,
      `${newSceneName}.scene.json`,
      `projects/default-project`,
      projectPath,
      true
    )

    if (isDev) {
      const projectPathLocal = path.resolve(appRootPath.path, 'packages/projects/projects/' + projectName) + '/'
      fs.copyFileSync(
        path.resolve(appRootPath.path, `packages/projects/default-project/default.thumbnail.jpeg`),
        path.resolve(projectPathLocal + newSceneName + '.thumbnail.jpeg')
      )
      fs.copyFileSync(
        path.resolve(appRootPath.path, `packages/projects/default-project/default.scene.json`),
        path.resolve(projectPathLocal + newSceneName + '.scene.json')
      )
    }

    return { projectName, sceneName: newSceneName }
  }

  async patch(id: NullableId, data: RenameParams, params?: Params): Promise<any> {
    const { newSceneName, oldSceneName, projectName } = data

    const storageProvider = getStorageProvider()

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const projectPath = `projects/${projectName}/`
    const oldSceneJsonName = `${oldSceneName}.scene.json`
    const newSceneJsonName = `${newSceneName}.scene.json`
    const oldSceneThumbnailName = `${oldSceneName}.thumbnail.jpeg`
    const newSceneThumbnailName = `${newSceneName}.thumbnail.jpeg`

    if (await storageProvider.doesExist(oldSceneJsonName, projectPath))
      await storageProvider.moveObject(oldSceneJsonName, newSceneJsonName, projectPath, projectPath)

    if (await storageProvider.doesExist(oldSceneThumbnailName, projectPath))
      await storageProvider.moveObject(oldSceneThumbnailName, newSceneThumbnailName, projectPath, projectPath)
    logger.info('isDev', isDev)
    if (isDev) {
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
    }

    return
  }

  async update(projectName: string, data: UpdateParams, params?: Params): Promise<any> {
    const { sceneName, sceneData, thumbnailBuffer } = data
    logger.info('[scene.update]: ', projectName, data)

    const storageProvider = getStorageProvider()

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = `projects/${projectName}/${sceneName}.scene.json`

    if (thumbnailBuffer) {
      const sceneThumbnailPath = `projects/${projectName}/${sceneName}.thumbnail.jpeg`
      await storageProvider.putObject({
        Key: sceneThumbnailPath,
        Body: thumbnailBuffer as Buffer,
        ContentType: 'image/jpeg'
      })
    }

    await storageProvider.putObject({
      Key: newSceneJsonPath,
      Body: Buffer.from(
        JSON.stringify(cleanSceneDataCacheURLs(sceneData ?? defaultSceneSeed, storageProvider.cacheDomain))
      ),
      ContentType: 'application/json'
    })

    if (isDev) {
      const newSceneJsonPathLocal = path.resolve(
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
        path.resolve(newSceneJsonPathLocal),
        JSON.stringify(cleanSceneDataCacheURLs(sceneData ?? defaultSceneSeed, storageProvider.cacheDomain), null, 2)
      )
    }
  }

  // async patch(sceneId: NullableId, data: PatchData, params: Params): Promise<SceneDetailInterface> {}

  // @ts-ignore
  async remove({ projectName, sceneName }, params?: Params): Promise<any> {
    const storageProvider = getStorageProvider()

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

    await storageProvider.deleteResources([
      `projects/${projectName}/${name}.scene.json`,
      `projects${projectName}/${name}.thumbnail.jpeg`
    ])
  }
}

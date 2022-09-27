import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { SceneData, SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'
import defaultSceneSeed from '@xrengine/projects/default-project/default.scene.json'

import { Application } from '../../../declarations'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getCachedURL } from '../../media/storageprovider/getCachedURL'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import logger from '../../ServerLogger'
import { cleanString } from '../../util/cleanString'
import { cleanSceneDataCacheURLs, parseSceneDataCacheURLs } from './scene-parser'

const NEW_SCENE_NAME = 'New-Scene'

const sceneAssetFiles = ['.scene.json', '.thumbnail.jpeg', '.envmap.png']

export const getSceneData = async (
  projectName: string,
  sceneName: string,
  metadataOnly: boolean,
  internal = false,
  storageProviderName?: string
) => {
  const storageProvider = getStorageProvider(storageProviderName)
  const scenePath = `projects/${projectName}/${sceneName}.scene.json`
  const thumbnailPath = `projects/${projectName}/${sceneName}.thumbnail.jpeg`

  const cacheDomain = getCacheDomain(storageProvider, internal)
  const thumbnailUrl = getCachedURL(thumbnailPath, cacheDomain)

  const sceneExists = await storageProvider.doesExist(`${sceneName}.scene.json`, `projects/${projectName}/`)
  if (sceneExists) {
    const sceneResult = await storageProvider.getCachedObject(scenePath)
    const sceneData: SceneData = {
      name: sceneName,
      project: projectName,
      thumbnailUrl: thumbnailUrl + `?${Date.now()}`,
      scene: metadataOnly ? undefined! : parseSceneDataCacheURLs(JSON.parse(sceneResult.Body.toString()), cacheDomain)
    }
    return sceneData
  }
  throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)
}

interface UpdateParams {
  sceneName: string
  sceneData?: SceneJson
  thumbnailBuffer?: ArrayBuffer | Buffer // ArrayBuffer on client, Buffer on server
  storageProviderName?: string
}

interface RenameParams {
  newSceneName: string
  oldSceneName: string
  projectName: string
  storageProviderName?: string
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
    const storageProviderName = data.storageProviderName
    delete data.storageProviderName

    const storageProvider = getStorageProvider(storageProviderName)

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

    await Promise.all(
      sceneAssetFiles.map((ext) =>
        storageProvider.moveObject(
          `default${ext}`,
          `${newSceneName}${ext}`,
          `projects/default-project`,
          projectPath,
          true
        )
      )
    )
    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `projects/${projectName}/${newSceneName}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }

    if (isDev) {
      const projectPathLocal = path.resolve(appRootPath.path, 'packages/projects/projects/' + projectName) + '/'
      for (const ext of sceneAssetFiles) {
        fs.copyFileSync(
          path.resolve(appRootPath.path, `packages/projects/default-project/default${ext}`),
          path.resolve(projectPathLocal + newSceneName + ext)
        )
      }
    }

    return { projectName, sceneName: newSceneName }
  }

  async patch(id: NullableId, data: RenameParams, params?: Params): Promise<any> {
    const { newSceneName, oldSceneName, projectName, storageProviderName } = data

    const storageProvider = getStorageProvider(storageProviderName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const projectPath = `projects/${projectName}/`

    for (const ext of sceneAssetFiles) {
      const oldSceneJsonName = `${oldSceneName}${ext}`
      const newSceneJsonName = `${newSceneName}${ext}`

      if (await storageProvider.doesExist(oldSceneJsonName, projectPath)) {
        await storageProvider.moveObject(oldSceneJsonName, newSceneJsonName, projectPath, projectPath)
        try {
          await storageProvider.createInvalidation([projectPath + oldSceneJsonName, projectPath + newSceneJsonName])
        } catch (e) {
          logger.error(e)
          logger.info(projectPath + oldSceneJsonName, projectPath + newSceneJsonName)
        }
      }
    }

    if (isDev) {
      for (const ext of sceneAssetFiles) {
        const oldSceneJsonPath = path.resolve(
          appRootPath.path,
          `packages/projects/projects/${projectName}/${oldSceneName}${ext}`
        )
        if (fs.existsSync(oldSceneJsonPath)) {
          const newSceneJsonPath = path.resolve(
            appRootPath.path,
            `packages/projects/projects/${projectName}/${newSceneName}${ext}`
          )
          fs.renameSync(oldSceneJsonPath, newSceneJsonPath)
        }
      }
    }

    return
  }

  async update(projectName: string, data: UpdateParams, params?: Params): Promise<any> {
    const { sceneName, sceneData, thumbnailBuffer, storageProviderName } = data
    logger.info('[scene.update]: ', projectName, data)

    const storageProvider = getStorageProvider(storageProviderName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = `projects/${projectName}/${sceneName}.scene.json`
    await storageProvider.putObject({
      Key: newSceneJsonPath,
      Body: Buffer.from(
        JSON.stringify(cleanSceneDataCacheURLs(sceneData ?? defaultSceneSeed, storageProvider.cacheDomain))
      ),
      ContentType: 'application/json'
    })

    if (thumbnailBuffer) {
      const sceneThumbnailPath = `projects/${projectName}/${sceneName}.thumbnail.jpeg`
      await storageProvider.putObject({
        Key: sceneThumbnailPath,
        Body: thumbnailBuffer as Buffer,
        ContentType: 'image/jpeg'
      })
    }

    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `projects/${projectName}/${sceneName}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }

    if (isDev) {
      const newSceneJsonPathLocal = path.resolve(
        appRootPath.path,
        `packages/projects/projects/${projectName}/${sceneName}.scene.json`
      )

      fs.writeFileSync(
        path.resolve(newSceneJsonPathLocal),
        JSON.stringify(cleanSceneDataCacheURLs(sceneData ?? defaultSceneSeed, storageProvider.cacheDomain), null, 2)
      )

      if (thumbnailBuffer) {
        const sceneThumbnailPath = path.resolve(
          appRootPath.path,
          `packages/projects/projects/${projectName}/${sceneName}.thumbnail.jpeg`
        )
        fs.writeFileSync(path.resolve(sceneThumbnailPath), thumbnailBuffer as Buffer)
      }
    }

    // return scene id for update hooks
    return { sceneId: `${projectName}/${sceneName}` }
  }

  // async patch(sceneId: NullableId, data: PatchData, params: Params): Promise<SceneDetailInterface> {}

  // @ts-ignore
  async remove(data, params?: Params): Promise<any> {
    const projectName = data.projectName
    const sceneName = data.sceneName
    const storageProviderName = data.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)

    const name = cleanString(sceneName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    for (const ext of sceneAssetFiles) {
      const assetFilePath = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/${name}${ext}`)
      if (fs.existsSync(assetFilePath)) {
        fs.rmSync(path.resolve(assetFilePath))
      }
    }

    await storageProvider.deleteResources(sceneAssetFiles.map((ext) => `projects/${projectName}/${name}${ext}`))

    try {
      await storageProvider.createInvalidation(
        sceneAssetFiles.map((asset) => `projects/${projectName}/${sceneName}${asset}`)
      )
    } catch (e) {
      logger.error(e)
      logger.info(sceneAssetFiles)
    }
  }
}

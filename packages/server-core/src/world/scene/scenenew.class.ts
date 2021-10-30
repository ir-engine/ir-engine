import { Params, NullableId, ServiceMethods } from '@feathersjs/feathers'
import {
  mapSceneDetailData,
  defaultSceneImport,
  readJSONFromBlobStore,
  mapSceneTemplateDetailData
} from './scene-helper'
import { Application } from '../../../declarations'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { SceneDetailInterface, SceneJson, SceneSaveInterface } from '@xrengine/common/src/interfaces/SceneInterface'

import fs from 'fs'
import path from 'path'
import appRootPath from 'app-root-path'
import { getCachedAsset } from '../../media/storageprovider/storageProviderUtils'
import { cleanString } from '../../util/cleanString'

interface Data {}
interface ServiceOptions {}

export class Scene implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(params: Params): Promise<any> {
    throw new Error('scene.find is not supported')
  }

  async get({ projectName, sceneName, metadataOnly }, params?: Params): Promise<SceneDetailInterface> {
    console.log('get scene', projectName, sceneName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${sceneName}.scene.json`
    )
    if (!fs.existsSync(newSceneJsonPath))
      throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)

    const sceneThumbnailPath = getCachedAsset(`/${projectName}/${sceneName}.thumbnail.png`)

    const sceneData: SceneDetailInterface = {
      name: sceneName,
      thumbnailUrl: sceneThumbnailPath,
      scene: metadataOnly && (JSON.parse(fs.readFileSync(path.resolve(newSceneJsonPath), 'utf8')) as SceneJson)
    }
    console.log(sceneData)

    return sceneData
  }

  async create({ projectName, sceneName }, params: Params): Promise<any> {
    console.log('create new scene', projectName, sceneName)
    const name = cleanString(sceneName)

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${name}.scene.json`
    )
    if (!fs.existsSync(newSceneJsonPath)) {
      fs.writeFileSync(path.resolve(newSceneJsonPath), JSON.stringify({}, null, 2))
    }
  }

  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  // async patch(sceneId: NullableId, data: PatchData, params: Params): Promise<SceneDetailInterface> {}

  // async remove(id: NullableId, params?: Params): Promise<Data> {}
}

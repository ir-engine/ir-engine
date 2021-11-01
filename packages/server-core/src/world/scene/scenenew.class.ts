import { Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'
import fs from 'fs'
import path from 'path'
import appRootPath from 'app-root-path'
import { getCachedAsset } from '../../media/storageprovider/storageProviderUtils'
import { cleanString } from '../../util/cleanString'

export const getSceneData = (projectName, sceneName, metadataOnly) => {
  const newSceneJsonPath = path.resolve(
    appRootPath.path,
    `packages/projects/projects/${projectName}/${sceneName}.scene.json`
  )

  if (!fs.existsSync(newSceneJsonPath)) throw new Error(`No scene named ${sceneName} exists in project ${projectName}`)

  const sceneThumbnailPath = getCachedAsset(`projects/${projectName}/${sceneName}.thumbnail.jpeg`)

  const sceneData: SceneDetailInterface = {
    name: sceneName,
    thumbnailUrl: sceneThumbnailPath,
    scene: metadataOnly ? undefined : JSON.parse(fs.readFileSync(path.resolve(newSceneJsonPath), 'utf8'))
  }

  return sceneData
}

export class Scene implements ServiceMethods<any> {
  app: Application
  docs: any

  constructor(app: Application) {
    this.app = app
  }

  async setup() {}

  async find(params: Params): Promise<any> {
    throw new Error('scene.find is not supported')
  }

  // @ts-ignore
  async get({ projectName, sceneName, metadataOnly }, params?: Params): Promise<{ data: SceneDetailInterface }> {
    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const sceneData = getSceneData(projectName, sceneName, metadataOnly)

    return {
      data: sceneData
    }
  }

  async create({ projectName, sceneName }, params?: Params): Promise<any> {
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

  async update(projectName: string, { sceneName, sceneData }, params?: Params): Promise<any> {
    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const newSceneJsonPath = path.resolve(
      appRootPath.path,
      `packages/projects/projects/${projectName}/${sceneName}.scene.json`
    )

    if (fs.existsSync(newSceneJsonPath)) {
      fs.writeFileSync(path.resolve(newSceneJsonPath), JSON.stringify(sceneData, null, 2))
    } else {
      throw new Error(`No scene named ${sceneName} exist in project ${projectName}`)
    }
  }

  // async patch(sceneId: NullableId, data: PatchData, params: Params): Promise<SceneDetailInterface> {}

  // @ts-ignore
  async remove({ projectName, sceneName }, params?: Params): Promise<any> {
    const name = cleanString(sceneName)

    if (projectName === 'theoverlay') return

    const project = await this.app.service('project').get(projectName, params)
    if (!project.data) throw new Error(`No project named ${projectName} exists`)

    const sceneJsonPath = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/${name}.scene.json`)
    if (fs.existsSync(sceneJsonPath)) {
      fs.rmSync(path.resolve(sceneJsonPath))
    }
  }
}

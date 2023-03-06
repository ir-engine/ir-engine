import { FileLoader } from 'three'

import { gltfToSceneJson } from '@etherealengine/engine/src/scene/functions/GLTFConversion'
import { loadECSData } from '@etherealengine/engine/src/scene/systems/SceneLoadingSystem'

import { Entity } from '../../ecs/classes/Entity'
import { EntityOrObjectUUID } from '../../ecs/functions/EntityTree'
import { AssetLoader } from './AssetLoader'

export type OnLoadType = (response: EntityOrObjectUUID[]) => EntityOrObjectUUID[] | void

export class XRELoader {
  fileLoader: FileLoader
  isXRELoader: true
  rootNode: Entity | undefined

  constructor(loader?: FileLoader) {
    this.isXRELoader = true
    if (loader) {
      this.fileLoader = loader
    } else {
      this.fileLoader = new FileLoader()
    }
  }

  parse(data: string, onLoad: OnLoadType = (response) => response) {
    const result = gltfToSceneJson(JSON.parse(data))
    return loadECSData(result, this.rootNode).then(onLoad)
  }

  load(
    _url: string,
    onLoad: OnLoadType = (response: Entity[]) => {},
    onProgress = (request: ProgressEvent) => {},
    onError = (event: ErrorEvent | Error) => {}
  ) {
    const url = AssetLoader.getAbsolutePath(_url)
    const loadCallback = (response) => {
      this.parse(response, onLoad)
    }
    this.fileLoader.load(url, loadCallback, onProgress, onError)
  }
}

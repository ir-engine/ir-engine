import { FileLoader } from 'three'

import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { gltfToSceneJson } from '@xrengine/engine/src/scene/functions/GLTFConversion'
import { loadECSData } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'

import { AssetLoader } from './AssetLoader'

export class XRELoader {
  fileLoader: FileLoader
  isXRELoader: true
  rootNode: EntityTreeNode | undefined

  constructor(loader?: FileLoader) {
    this.isXRELoader = true
    if (loader) {
      this.fileLoader = loader
    } else {
      this.fileLoader = new FileLoader()
    }
  }

  parse(data: string, onLoad = (response: EntityTreeNode[]) => {}) {
    const result = gltfToSceneJson(JSON.parse(data))
    return loadECSData(result, this.rootNode).then(onLoad)
  }

  load(
    _url: string,
    onLoad = (response: EntityTreeNode[]) => {},
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

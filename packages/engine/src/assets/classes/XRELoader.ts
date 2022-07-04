import { FileLoader } from 'three'

import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { gltfToSceneJson } from '@xrengine/engine/src/scene/functions/GLTFConversion'
import { loadECSData, loadSceneFromJSON, preCacheAssets } from '@xrengine/engine/src/scene/functions/SceneLoading'

import { AssetLoader } from './AssetLoader'

export class XRELoader {
  fileLoader: FileLoader

  constructor(loader?: FileLoader) {
    if (loader) {
      this.fileLoader = loader
    } else {
      this.fileLoader = new FileLoader()
    }
  }

  parse(data: string, onLoad = (response: EntityTreeNode[]) => {}) {
    const result = gltfToSceneJson(JSON.parse(data))
    return Promise.all(preCacheAssets(result, () => {}))
      .then(() => loadECSData(result))
      .then(onLoad)
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

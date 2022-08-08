import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { isClient } from '../../common/functions/isClient'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { GLTFHubsComponentsExtension } from '../classes/GLTFHubsComponentsExtension'
import { GLTFHubsLightMapExtension } from '../classes/GLTFHubsLightMapExtension'
import { GLTFInstancingExtension } from '../classes/GLTFInstancingExtension'
import { GLTFRemoveMaterialsExtension } from '../classes/GLTFRemoveMaterialsExtension'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { GLTFLoader } from '../loaders/gltf/GLTFLoader'
import { KTX2Loader } from '../loaders/gltf/KTX2Loader'
import { MeshoptDecoder } from '../loaders/gltf/meshopt_decoder.module'
import { NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'

export const initializeKTX2Loader = (loader: GLTFLoader) => {
  const ktxLoader = new KTX2Loader()
  ktxLoader.workerPool.setWorkerLimit(1)
  ktxLoader.setTranscoderPath(`/loader_decoders/basis/`)
  ktxLoader.detectSupport(EngineRenderer.instance.renderer)
  loader.setKTX2Loader(ktxLoader)
}

export const createGLTFLoader = (keepMaterials = false) => {
  const loader = new GLTFLoader()

  if (!isClient && !keepMaterials) {
    loader.register((parser) => new GLTFRemoveMaterialsExtension(parser))
  }

  loader.register((parser) => new GLTFInstancingExtension(parser))
  loader.register((parser) => new GLTFHubsLightMapExtension(parser))
  loader.register((parser) => new GLTFHubsComponentsExtension(parser))
  loader.register((parser) => new VRMLoaderPlugin(parser))

  loader.setMeshoptDecoder(MeshoptDecoder)

  if (isClient) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/loader_decoders/')
    dracoLoader.setWorkerLimit(1)
    loader.setDRACOLoader(dracoLoader)
  } else {
    const dracoLoader = new NodeDRACOLoader()
    /* @ts-ignore */
    dracoLoader.preload = () => {}
    /* @ts-ignore */
    loader.setDRACOLoader(dracoLoader)
  }

  return loader
}

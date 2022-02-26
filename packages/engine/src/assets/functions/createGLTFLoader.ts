import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { isClient } from '../../common/functions/isClient'
import { GLTFHubsComponentsExtension } from '../classes/GLTFHubsComponentsExtension'
import { GLTFHubsLightMapExtension } from '../classes/GLTFHubsLightMapExtension'
import { GLTFInstancingExtension } from '../classes/GLTFInstancingExtension'
import { GLTFRemoveMaterialsExtension } from '../classes/GLTFRemoveMaterialsExtension'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { GLTFLoader } from '../loaders/gltf/GLTFLoader'
import { NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'

export const createGLTFLoader = (keepMaterials = false) => {
  const loader = new GLTFLoader()

  if (!isClient && !keepMaterials) {
    loader.register((parser) => new GLTFRemoveMaterialsExtension(parser))
  }

  loader.register((parser) => new GLTFInstancingExtension(parser))
  loader.register((parser) => new GLTFHubsLightMapExtension(parser))
  loader.register((parser) => new GLTFHubsComponentsExtension(parser))
  loader.register((parser) => new VRMLoaderPlugin(parser))

  const dracoLoader: any = isClient ? new DRACOLoader() : new NodeDRACOLoader()
  // const dracoLoader = new DRACOLoader()
  if (isClient) {
    dracoLoader.setDecoderPath('/loader_decoders/')
  } else {
    ;(dracoLoader as any).preload = () => {}
  }
  ;(loader as any).setDRACOLoader(dracoLoader)

  return loader
}

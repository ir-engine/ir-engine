import { GLTFRemoveMaterialsExtension } from '../classes/GLTFRemoveMaterialsExtension'
import { GLTFInstancingExtension } from '../classes/GLTFInstancingExtension'
import { NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { GLTFLoader } from '../loaders/gltf/GLTFLoader'
import { isClient } from '../../common/functions/isClient'

export const createGLTFLoader = (keepMaterials = false) => {
  const loader = new GLTFLoader()

  if (!isClient && !keepMaterials) {
    loader.register((parser) => new GLTFRemoveMaterialsExtension(parser))
  }

  loader.register((parser) => new GLTFInstancingExtension(parser))

  const dracoLoader: any = isClient ? new DRACOLoader() : new NodeDRACOLoader()
  // const dracoLoader = new DRACOLoader()
  if (isClient) {
    dracoLoader.setDecoderPath('/loader_decoders/')
  } else {
    ;(dracoLoader as any).getDecoderModule = () => {}
    ;(dracoLoader as any).preload = () => {}
  }
  ;(loader as any).setDRACOLoader(dracoLoader)

  return loader
}

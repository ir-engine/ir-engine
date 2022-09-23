import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { isClient } from '../../common/functions/isClient'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { EEMaterialImporterExtension } from '../loaders/gltf/extensions/EEMaterialImporterExtension'
import { GPUInstancingExtension } from '../loaders/gltf/extensions/GPUInstancingExtension'
import { HubsComponentsExtension } from '../loaders/gltf/extensions/HubsComponentsExtension'
import { HubsLightMapExtension } from '../loaders/gltf/extensions/LightMapExtension'
import RegisterMaterialsExtension from '../loaders/gltf/extensions/RegisterMaterialsExtension'
import { RemoveMaterialsExtension } from '../loaders/gltf/extensions/RemoveMaterialsExtension'
import { GLTFLoader } from '../loaders/gltf/GLTFLoader'
import { KTX2Loader } from '../loaders/gltf/KTX2Loader'
import { MeshoptDecoder } from '../loaders/gltf/meshopt_decoder.module'
import { NodeDRACOLoader } from '../loaders/gltf/NodeDracoLoader'

export const initializeKTX2Loader = (loader: GLTFLoader) => {
  const ktxLoader = new KTX2Loader()
  ktxLoader.setTranscoderPath(`/loader_decoders/basis/`)
  ktxLoader.detectSupport(EngineRenderer.instance.renderer)
  loader.setKTX2Loader(ktxLoader)
}

export const createGLTFLoader = (keepMaterials = false) => {
  const loader = new GLTFLoader()

  if (isClient || keepMaterials) {
    loader.register((parser) => new GPUInstancingExtension(parser))
    loader.register((parser) => new HubsLightMapExtension(parser))
    loader.register((parser) => new EEMaterialImporterExtension(parser))
    loader.register((parser) => new RegisterMaterialsExtension(parser))
  } else {
    loader.register((parser) => new RemoveMaterialsExtension(parser))
  }

  loader.register((parser) => new HubsComponentsExtension(parser))
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

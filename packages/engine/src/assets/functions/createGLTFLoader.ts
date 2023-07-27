/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { getState } from '@etherealengine/hyperflux'

import { isClient } from '../../common/functions/getEnvironment'
import { EngineState } from '../../ecs/classes/EngineState'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { DRACOLoader } from '../loaders/gltf/DRACOLoader'
import { CachedImageLoadExtension } from '../loaders/gltf/extensions/CachedImageLoadExtension'
import EEECSImporterExtension from '../loaders/gltf/extensions/EEECSImporterExtension'
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
  ktxLoader.setTranscoderPath(getState(EngineState).publicPath + '/loader_decoders/basis/')
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
  loader.register((parser) => new EEECSImporterExtension(parser))
  loader.register((parser) => new HubsComponentsExtension(parser))
  loader.register((parser) => new VRMLoaderPlugin(parser))
  loader.register((parser) => new CachedImageLoadExtension(parser))
  loader.setMeshoptDecoder(MeshoptDecoder)

  if (isClient) {
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath(getState(EngineState).publicPath + '/loader_decoders/')
    dracoLoader.setWorkerLimit(1)
    loader.setDRACOLoader(dracoLoader)
    initializeKTX2Loader(loader)
  } else {
    const dracoLoader = new NodeDRACOLoader()
    /* @ts-ignore */
    dracoLoader.preload = () => {}
    /* @ts-ignore */
    loader.setDRACOLoader(dracoLoader)
  }

  return loader
}

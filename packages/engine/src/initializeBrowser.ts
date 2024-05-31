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

import { ECSState } from '@etherealengine/ecs'
import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { getState } from '@etherealengine/hyperflux'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { ObjectLayers } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { PerformanceManager } from '@etherealengine/spatial/src/renderer/PerformanceState'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { WebLayerManager } from '@etherealengine/xrui'

import { initializeKTX2Loader } from './assets/functions/createGLTFLoader'
import { AssetLoaderState } from './assets/state/AssetLoaderState'

/**
 * initializeBrowser
 *
 * initializes everything for the browser context
 */
export const initializeBrowser = () => {
  const camera = getComponent(Engine.instance.viewerEntity, CameraComponent)

  camera.layers.disableAll()
  camera.layers.enable(ObjectLayers.Scene)
  camera.layers.enable(ObjectLayers.Avatar)
  camera.layers.enable(ObjectLayers.UI)
  camera.layers.enable(ObjectLayers.TransformGizmo)
  camera.layers.enable(ObjectLayers.UVOL)

  const renderer = getComponent(Engine.instance.viewerEntity, RendererComponent)
  if (!renderer?.renderer) throw new Error('renderer does not exist!')

  const gltfLoader = getState(AssetLoaderState).gltfLoader
  initializeKTX2Loader(gltfLoader)

  WebLayerManager.initialize(renderer.renderer, gltfLoader.ktx2Loader!)
  WebLayerManager.instance.ktx2Encoder.pool.setWorkerLimit(1)

  PerformanceManager.buildPerformanceState(renderer, () => {
    getState(ECSState).timer.start()
  })
}

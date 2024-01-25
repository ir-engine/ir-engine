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

import { BotUserAgent } from '@etherealengine/common/src/constants/BotUserAgent'
import { getMutableState } from '@etherealengine/hyperflux'
import { WebLayerManager } from '@etherealengine/xrui'

import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { EngineState } from '@etherealengine/engine/src/EngineState'
import { CameraComponent } from './camera/components/CameraComponent'
import { EngineRenderer } from './renderer/WebGLRendererSystem'
import { ObjectLayers } from './scene/constants/ObjectLayers'

/**
 * initializeBrowser
 *
 * initializes everything for the browser context
 */
export const initializeBrowser = () => {
  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)

  camera.layers.disableAll()
  camera.layers.enable(ObjectLayers.Scene)
  camera.layers.enable(ObjectLayers.Avatar)
  camera.layers.enable(ObjectLayers.UI)
  camera.layers.enable(ObjectLayers.TransformGizmo)

  getMutableState(EngineState).isBot.set(navigator.userAgent === BotUserAgent)

  const renderer = EngineRenderer.instance.renderer
  if (!renderer) throw new Error('EngineRenderer.instance.renderer does not exist!')

  WebLayerManager.initialize(renderer)
  WebLayerManager.instance.ktx2Encoder.pool.setWorkerLimit(1)

  setupInitialClickListener()
  Engine.instance.engineTimer.start()
}

const setupInitialClickListener = () => {
  const canvas = EngineRenderer.instance.renderer.domElement
  const initialClickListener = () => {
    window.removeEventListener('click', initialClickListener)
    window.removeEventListener('touchend', initialClickListener)
    canvas.removeEventListener('click', initialClickListener)
    canvas.removeEventListener('touchend', initialClickListener)
  }
  window.addEventListener('click', initialClickListener)
  window.addEventListener('touchend', initialClickListener)
  canvas.addEventListener('click', initialClickListener)
  canvas.addEventListener('touchend', initialClickListener)
}

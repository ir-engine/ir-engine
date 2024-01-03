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

import { RenderPass } from 'postprocessing'
import { MeshBasicMaterial, MeshNormalMaterial } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { RendererState } from '../RendererState'
import { EngineRenderer } from '../WebGLRendererSystem'
import { RenderModes } from '../constants/RenderModes'
import { updateShadowMap } from './RenderSettingsFunction'

/**
 * Change render mode of the renderer
 * @param mode Mode which will be set to renderer
 */
export function changeRenderMode() {
  const renderMode = getState(RendererState).renderMode

  // revert any changes made by a render mode
  switch (renderMode) {
    case RenderModes.UNLIT:
      // Not currently working, will be replaced with custom renderer in the future

      // iterateObject3D(Engine.instance.scene, (obj: Light) => {
      //   if (obj.isLight && obj.userData.editor_disabled) {
      //     delete obj.userData.editor_disabled
      //     obj.visible = true
      //   }
      // })
      break
    default:
      break
  }

  const passes = EngineRenderer.instance.effectComposer?.passes.filter((p) => p.name === 'RenderPass') as any
  const renderPass: RenderPass = passes ? passes[0] : undefined

  if (!renderPass) return

  switch (renderMode) {
    case RenderModes.UNLIT:
      // See above comment
      // iterateObject3D(Engine.instance.scene, (obj: Light) => {
      //   if (obj.isLight && obj.visible) {
      //     obj.userData.editor_disabled = true
      //     obj.visible = false
      //   }
      // })
      renderPass.overrideMaterial = null!
      break
    case RenderModes.LIT:
      renderPass.overrideMaterial = null!
      break
    case RenderModes.SHADOW:
      renderPass.overrideMaterial = null!
      break
    case RenderModes.WIREFRAME:
      renderPass.overrideMaterial = new MeshBasicMaterial({
        wireframe: true
      })
      break
    case RenderModes.NORMALS:
      renderPass.overrideMaterial = new MeshNormalMaterial()
      break
  }

  updateShadowMap()
}

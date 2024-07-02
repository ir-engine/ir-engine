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

import { Engine, Entity, getComponent } from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'

import { RendererState } from '../RendererState'
import { RendererComponent } from '../WebGLRendererSystem'
import { RenderModes } from '../constants/RenderModes'

/**
 * Change render mode of the renderer
 * @param mode Mode which will be set to renderer
 */

export function changeRenderMode(entity: Entity) {
  const renderMode = getState(RendererState).renderMode

  const passes = getComponent(Engine.instance.viewerEntity, RendererComponent).effectComposer?.passes.filter(
    (p) => p.name === 'RenderPass'
  ) as any
  const renderPass: RenderPass = passes ? passes[0] : undefined
  if (!renderPass) return

  switch (renderMode) {
    case RenderModes.UNLIT:
    case RenderModes.LIT:
    case RenderModes.SHADOW:
      renderPass.overrideMaterial = null!
      break
    case RenderModes.WIREFRAME:
      renderPass.overrideMaterial = new MeshBasicMaterial({
        color: 0x000000,
        wireframe: true
      })
      break
    case RenderModes.NORMALS:
      renderPass.overrideMaterial = new MeshNormalMaterial()
      break
  }
}

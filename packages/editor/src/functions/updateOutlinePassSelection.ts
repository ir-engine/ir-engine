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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent, getOptionalComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { Effects } from '@etherealengine/engine/src/scene/constants/PostProcessing'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'
import { getState } from '@etherealengine/hyperflux'

import { SelectionState } from '../services/SelectionServices'

export const updateOutlinePassSelection = (): void => {
  if (!EngineRenderer.instance.effectComposer || !EngineRenderer.instance.effectComposer[Effects.OutlineEffect]) return

  const meshes = [] as any[]
  const parentEntities = getState(SelectionState).selectedParentEntities
  for (let i = 0; i < parentEntities.length; i++) {
    const parentEnt = parentEntities[i]
    const isUuid = typeof parentEnt === 'string'
    const group = isUuid
      ? [obj3dFromUuid(parentEnt)]
      : getOptionalComponent(parentEntities[i] as Entity, GroupComponent)
    if (group)
      for (const obj3d of group)
        obj3d?.traverse((child: any) => {
          if (child.isMesh || child.isLine || child.isSprite || child.isPoints) {
            meshes.push(child)
          }
        })
  }

  EngineRenderer.instance.effectComposer[Effects.OutlineEffect].selection.set(meshes)
}

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

import { WebLayer3D } from '@etherealengine/xrui'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '../../xrui/components/XRUIComponent'
import { createInteractiveModalView } from '../ui/InteractiveModalView'

export function createInteractUI(entity: Entity, interactMessage: string) {
  const ui = createInteractiveModalView(entity, interactMessage)
  const nameComponent = getComponent(entity, NameComponent)
  addComponent(ui.entity, NameComponent, 'interact-ui-' + interactMessage + '-' + nameComponent)

  const xrui = getComponent(ui.entity, XRUIComponent)
  xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })
  const transform = getComponent(ui.entity, TransformComponent)
  transform.scale.setScalar(1)

  return ui
}

export const updateInteractUI = (entity: Entity, xrui: ReturnType<typeof createInteractUI>) => {}

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

import { getComponent, setComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { XRUIComponent } from '@etherealengine/spatial/src/xrui/components/XRUIComponent'
import { WebLayer3D } from '@etherealengine/xrui'

import { createEntity } from '@etherealengine/ecs'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Color, DoubleSide, Mesh, MeshPhysicalMaterial, Shape, ShapeGeometry, Vector3 } from 'three'
import { createModalView } from '../ui/InteractiveModalView'

/**
 * Creates and returns an xrUI on the specified entity
 * (this replaces createInteractUI and createNonInteractUI (by adding a bool isInteractable optional param)
 * @param entity  entity to add the xrUI to
 * @param uiMessage  text to display on the UI
 * @param isInteractable  (optional, default = true) sets whether the UI is interactable or not
 */
export function createUI(entity: Entity, uiMessage: string, isInteractable = true) {
  const ui = createModalView(entity, uiMessage, isInteractable)

  const blurMat = new MeshPhysicalMaterial({
    color: new Color('#B9B9B9'),
    transmission: 1,
    roughness: 0.5,
    opacity: 0.95,
    transparent: true,
    side: DoubleSide
  })

  const backgroundEid = createEntity()
  const mesh = new Mesh(roundedRect(-(100 / 1000) / 2, -(100 / 1000) / 2, 100 / 1000, 100 / 1000, 0.01), blurMat)
  setComponent(backgroundEid, EntityTreeComponent, { parentEntity: ui.entity })
  setComponent(backgroundEid, MeshComponent, mesh)
  setComponent(backgroundEid, VisibleComponent)
  const backgroundTransform = setComponent(backgroundEid, TransformComponent, { position: new Vector3(0, 0, -0.001) })
  addObjectToGroup(backgroundEid, mesh) // TODO: this should be managed by the MeshComponent
  const nameComponent = getComponent(entity, NameComponent)
  setComponent(ui.entity, NameComponent, 'interact-ui-' + uiMessage + '-' + nameComponent)

  const xrui = getComponent(ui.entity, XRUIComponent)
  xrui.rootLayer.traverseLayersPreOrder((layer: WebLayer3D) => {
    const mat = layer.contentMesh.material as THREE.MeshBasicMaterial
    mat.transparent = true
  })
  const transform = getComponent(ui.entity, TransformComponent)
  transform.scale.setScalar(1)

  return ui
}

function roundedRect(x: number, y: number, width: number, height: number, radius: number): ShapeGeometry {
  const shape = new Shape()
  shape.moveTo(x, y + radius)
  shape.lineTo(x, y + height - radius)
  shape.quadraticCurveTo(x, y + height, x + radius, y + height)
  shape.lineTo(x + width - radius, y + height)
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius)
  shape.lineTo(x + width, y + radius)
  shape.quadraticCurveTo(x + width, y, x + width - radius, y)
  shape.lineTo(x + radius, y)
  shape.quadraticCurveTo(x, y, x, y + radius)
  return new ShapeGeometry(shape)
}

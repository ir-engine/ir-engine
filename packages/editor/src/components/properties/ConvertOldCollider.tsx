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

import { Entity, getComponent, setComponent, useOptionalComponent } from '@etherealengine/ecs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import {
  findAncestorWithComponent,
  iterateEntityNode
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import React from 'react'
import { Button } from '../inputs/Button'

const OldShapeTypes = {
  Cuboid: 'box',
  Ball: 'sphere',
  Cylinder: 'cylinder',
  Capsule: 'capsule',
  TriMesh: 'mesh'
}

const convert = (entity: Entity) => {
  const groupComponent = getComponent(entity, GroupComponent)
  const objWithMetadata = groupComponent.find(
    (obj) => !!obj.userData['xrengine.collider'] || !!obj.userData['xrengine.collider.bodyType']
  )!

  const modelEntity = findAncestorWithComponent(entity, ModelComponent)!
  setComponent(modelEntity, RigidBodyComponent, {
    type: objWithMetadata?.userData?.['xrengine.collider.bodyType'] ?? 'static'
  })

  console.log(objWithMetadata, groupComponent)

  if (objWithMetadata) {
    delete objWithMetadata.userData['xrengine.collider.bodyType']
    delete objWithMetadata.userData['xrengine.entity']
  }

  iterateEntityNode(entity, (child) => {
    const childWithMetadata = getComponent(child, GroupComponent)?.find(
      (obj) =>
        !!obj.userData['type'] ||
        !!obj.userData['xrengine.collider.type'] ||
        !!obj.userData['xrengine.collider.shapeType'] ||
        !!obj.userData['shapeType'] ||
        !!obj.userData['isTrigger']
    )
    console.log(childWithMetadata, getComponent(child, GroupComponent))
    if (!childWithMetadata) return

    const shape =
      OldShapeTypes[
        childWithMetadata.userData['type'] ??
          childWithMetadata.userData['xrengine.collider.type'] ??
          childWithMetadata.userData['xrengine.collider.shapeType'] ??
          childWithMetadata.userData['shapeType']
      ] ?? 'box'
    delete childWithMetadata.userData['type']
    delete childWithMetadata.userData['shapeType']
    setComponent(child, ColliderComponent, { shape })

    const isTrigger = childWithMetadata.userData['isTrigger'] ?? false
    if (isTrigger === true || isTrigger === 'true') setComponent(child, TriggerComponent)
    delete childWithMetadata.userData['isTrigger']
  })
}

export const ConvertOldCollider = (props: { entity: Entity }) => {
  const groupComponent = useOptionalComponent(props.entity, GroupComponent)
  const hasMetadata = groupComponent?.some(
    (obj) => !!obj.userData['xrengine.collider'] || !!obj.userData['xrengine.collider.bodyType']
  )
  if (!hasMetadata) return <></>

  const modelEntity = findAncestorWithComponent(props.entity, ModelComponent)
  if (!modelEntity) return <></>

  return (
    <div>
      Old Collider Format Detected
      <Button onClick={() => convert(props.entity)}>Convert Now</Button>
    </div>
  )
}

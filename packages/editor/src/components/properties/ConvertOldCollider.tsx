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

import { Entity, getComponent, getOptionalComponent, hasComponent, setComponent } from '@etherealengine/ecs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@etherealengine/spatial/src/physics/components/TriggerComponent'
import { OldShapeTypes } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import {
  findAncestorWithComponent,
  iterateEntityNode
} from '@etherealengine/spatial/src/transform/components/EntityTree'
import React from 'react'
import { Button } from '../inputs/Button'

const convert = (entity: Entity, hierarchy: boolean) => {
  const groupComponent = getComponent(entity, GroupComponent)
  const objWithMetadata = groupComponent.find(
    (obj) => !!obj.userData['xrengine.collider'] || !!obj.userData['xrengine.collider.bodyType']
  )!

  const rigidbodyType = objWithMetadata?.userData?.['xrengine.collider.bodyType'] ?? 'static'
  const modelEntity = findAncestorWithComponent(entity, ModelComponent)!
  setComponent(modelEntity, RigidBodyComponent, {
    type: rigidbodyType
  })

  if (objWithMetadata) {
    delete objWithMetadata.userData['xrengine.collider.bodyType']
    objWithMetadata.userData[`xrengine.${RigidBodyComponent.jsonID}.shape`] = rigidbodyType
  }

  iterateEntityNode(entity, (child) => {
    const childWithMetadata = getComponent(child, GroupComponent)?.find(
      (obj) =>
        !!obj.userData['type'] ||
        !!obj.userData['xrengine.collider.type'] ||
        !!obj.userData['xrengine.collider.shapeType'] ||
        !!obj.userData['xrengine.collider.isTrigger'] ||
        !!obj.userData['shapeType'] ||
        !!obj.userData['isTrigger']
    )
    if (!childWithMetadata && !hierarchy) return

    const mesh = getOptionalComponent(child, MeshComponent)
    if (!mesh) return

    const shape =
      OldShapeTypes[
        mesh.userData['xrengine.collider.type'] ??
          mesh.userData['xrengine.collider.shapeType'] ??
          mesh.userData['shapeType'] ??
          mesh.userData['type']
      ] ?? 'box'
    delete mesh.userData['type']
    delete mesh.userData['shapeType']

    //mesh.userData[`xrengine.${ColliderComponent.jsonID}.shape`] = shape
    setComponent(child, ColliderComponent, { shape })

    const isTrigger = mesh.userData['isTrigger'] ?? mesh.userData['xrengine.collider.isTrigger'] ?? false
    if (isTrigger === true || isTrigger === 'true') {
      setComponent(child, TriggerComponent)
      delete mesh.userData['isTrigger']
      delete mesh.userData['xrengine.collider.isTrigger']
      //mesh.userData[`xrengine.${TriggerComponent.jsonID}`] = true
    }
  })
}

const detectOldColliders = (entity: Entity) => {
  let hasOldCollider = false
  let hasNewCollider = false
  iterateEntityNode(entity, (child) => {
    const groupComponent = getComponent(child, GroupComponent)
    const hasMetadata = groupComponent.some(
      (obj) => !!obj.userData['xrengine.collider'] || !!obj.userData['xrengine.collider.bodyType']
    )
    if (hasMetadata) hasOldCollider = true
    if (hasComponent(child, ColliderComponent)) hasNewCollider = true
  })
  return hasOldCollider && !hasNewCollider
}

export const ConvertOldCollider = (props: { entity: Entity }) => {
  const modelEntity = findAncestorWithComponent(props.entity, ModelComponent)
  if (!modelEntity) return <></>

  const needsConversion = detectOldColliders(props.entity)
  if (!needsConversion) return <></>

  return (
    <div>
      Old Collider Format Detected
      <Button onClick={() => convert(props.entity, false)}>Convert</Button>
      <Button onClick={() => convert(props.entity, true)}>Convert Hierarchy</Button>
    </div>
  )
}

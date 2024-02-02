import { Entity, getComponent, setComponent, useOptionalComponent } from '@etherealengine/ecs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { ColliderComponent } from '@etherealengine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
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
    type: objWithMetadata.userData['xrengine.collider.bodyType'] ?? 'static'
  })

  iterateEntityNode(entity, (child) => {
    const childWithMetadata = getComponent(child, GroupComponent)?.find((obj) => !!obj.userData['type'])
    if (!childWithMetadata) return
    const shape = OldShapeTypes[childWithMetadata.userData['type']] ?? 'box'
    setComponent(child, ColliderComponent, { shape })
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

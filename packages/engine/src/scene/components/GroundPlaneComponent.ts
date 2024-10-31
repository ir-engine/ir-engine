/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Mesh, MeshStandardMaterial, PlaneGeometry } from 'three'

import { UUIDComponent } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import {
  createEntity,
  entityExists,
  generateEntityUUID,
  removeEntity,
  useEntityContext
} from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useHookstate } from '@ir-engine/hyperflux'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { useMeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { useLayoutEffect } from 'react'

export const GroundPlaneComponent = defineComponent({
  name: 'GroundPlaneComponent',
  jsonID: 'EE_ground_plane',

  schema: S.Object({
    color: S.Color(0xffffff),
    visible: S.Bool(true)
  }),

  reactor: function () {
    const entity = useEntityContext()

    const component = useComponent(entity, GroundPlaneComponent)

    const meshEntity = useHookstate(() => {
      const meshEntity = createEntity()
      setComponent(meshEntity, EntityTreeComponent, { parentEntity: entity })
      setComponent(meshEntity, UUIDComponent, generateEntityUUID())
      return meshEntity
    }).value

    const mesh = useMeshComponent(
      meshEntity,
      () => new PlaneGeometry(10000, 10000),
      () => new MeshStandardMaterial()
    )

    useLayoutEffect(() => {
      const meshVal = mesh.value as Mesh<PlaneGeometry, MeshStandardMaterial>
      meshVal.geometry.rotateX(-Math.PI / 2)
      meshVal.name = 'GroundPlaneMesh'
      meshVal.material.polygonOffset = true
      meshVal.material.polygonOffsetFactor = -0.01
      meshVal.material.polygonOffsetUnits = 1

      setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Scene)
      setComponent(entity, RigidBodyComponent, { type: BodyTypes.Fixed })
      setComponent(entity, ColliderComponent, {
        shape: Shapes.Plane,
        collisionLayer: CollisionGroups.Ground,
        collisionMask: CollisionGroups.Default | CollisionGroups.Avatars
      })
      return () => {
        removeComponent(entity, RigidBodyComponent)
        removeComponent(entity, ColliderComponent)
        removeEntity(meshEntity)
      }
    }, [])

    useLayoutEffect(() => {
      const color = component.color.value
      mesh.material.color.value.set(color)
    }, [component.color])

    useLayoutEffect(() => {
      if (component.visible.value) {
        setComponent(meshEntity, VisibleComponent)
        return () => {
          if (entityExists(meshEntity)) removeComponent(meshEntity, VisibleComponent)
        }
      }
    }, [component.visible.value])

    return null
  }
})

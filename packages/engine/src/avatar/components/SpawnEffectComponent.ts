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

import { Easing, Tween } from '@tweenjs/tween.js'
import { useEffect } from 'react'
import { AdditiveBlending, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three'

import {
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectDirection, Vector3_Right, Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { Physics, RaycastArgs } from '@ir-engine/spatial/src/physics/classes/Physics'
import { AvatarCollisionMask, CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@ir-engine/spatial/src/physics/functions/getInteractionGroups'
import { SceneQueryType } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent, setVisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { TweenComponent } from '@ir-engine/spatial/src/transform/components/TweenComponent'

export const SpawnEffectComponent = defineComponent({
  name: 'SpawnEffectComponent',

  schema: S.Object({
    sourceEntity: T.Entity(),
    opacityMultiplier: S.Number(1),
    plateEntity: T.Entity(),
    lightEntities: S.Array(T.Entity())
  }),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      const effectComponent = getComponent(entity, SpawnEffectComponent)
      const sourceTransform = getComponent(effectComponent.sourceEntity, TransformComponent)
      /** Copy transform but do not attach to avatar */
      setComponent(entity, TransformComponent, { position: sourceTransform.position.clone() })
      const transform = getComponent(entity, TransformComponent)
      setComponent(entity, VisibleComponent, true)
      /** cast ray to move this downward to be on the ground */
      downwardGroundRaycast.origin.copy(sourceTransform.position)
      const physicsWorld = Physics.getWorld(entity)!
      const hits = Physics.castRay(physicsWorld, downwardGroundRaycast)
      if (hits.length) {
        transform.position.y = hits[0].position.y
      }

      createPlateEntity(entity)
      createRayEntities(entity)

      SpawnEffectComponent.fadeIn(entity)

      return () => {
        removeEntity(effectComponent.plateEntity!)
        for (const lightEntity of effectComponent.lightEntities!) {
          removeEntity(lightEntity)
        }
      }
    }, [])

    return null
  },

  fadeIn: (entity: Entity) => {
    const effectComponent = getComponent(entity, SpawnEffectComponent)
    setComponent(
      entity,
      TweenComponent,
      new Tween<any>(effectComponent)
        .to(
          {
            opacityMultiplier: 1
          },
          1000
        )
        .easing(Easing.Exponential.Out)
        .start()
        .onComplete(() => {
          removeComponent(entity, TweenComponent)
        })
    )
  },

  fadeOut: (entity: Entity) => {
    const effectComponent = getComponent(entity, SpawnEffectComponent)
    setComponent(
      entity,
      TweenComponent,
      new Tween<any>(effectComponent)
        .to(
          {
            opacityMultiplier: 0
          },
          2000
        )
        .start()
        .onComplete(() => {
          removeEntity(entity)
        })
    )
  },

  lightMesh: new Mesh(
    new PlaneGeometry(0.04, 3.2),
    new MeshBasicMaterial({
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  ),

  plateMesh: new Mesh(
    new PlaneGeometry(1.6, 1.6),
    new MeshBasicMaterial({
      transparent: false,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )
})

const createPlateEntity = (entity: Entity) => {
  const plateMesh = new Mesh(SpawnEffectComponent.plateMesh.geometry, SpawnEffectComponent.plateMesh.material)
  const plateEntity = createEntity()
  setComponent(plateEntity, NameComponent, 'Spawn Plate ' + entity)
  setComponent(plateEntity, EntityTreeComponent, { parentEntity: entity })
  addObjectToGroup(plateEntity, plateMesh)
  setVisibleComponent(plateEntity, true)
  const transform = getComponent(plateEntity, TransformComponent)
  transform.rotation.setFromAxisAngle(Vector3_Right, -0.5 * Math.PI)
  transform.position.y = 0.01
  getMutableComponent(entity, SpawnEffectComponent).plateEntity.set(plateEntity)
}

const createRayEntities = (entity: Entity) => {
  const R = 0.6 * SpawnEffectComponent.plateMesh.geometry.boundingSphere!.radius!
  const rayCount = 5 + 10 * R * Math.random()

  for (let i = 0; i < rayCount; i += 1) {
    const ray = SpawnEffectComponent.lightMesh.clone()

    const rayEntity = createEntity()
    setComponent(rayEntity, NameComponent, 'Spawn Ray ' + entity)
    setComponent(rayEntity, EntityTreeComponent, { parentEntity: entity })
    addObjectToGroup(rayEntity, ray)
    const transform = getComponent(rayEntity, TransformComponent)
    setVisibleComponent(rayEntity, true)
    getMutableComponent(entity, SpawnEffectComponent).lightEntities.merge([rayEntity])

    const a = (2 * Math.PI * i) / rayCount
    const r = R * Math.random()
    transform.position.x += r * Math.cos(a)
    transform.position.y += 0.5 * ray.geometry.boundingSphere!.radius! * Math.random()
    transform.position.z += r * Math.sin(a)

    transform.rotation.setFromAxisAngle(Vector3_Up, Math.random() * 2 * Math.PI)
  }
}

const downwardGroundRaycast = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: ObjectDirection.Down,
  maxDistance: 10,
  groups: getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
} as RaycastArgs

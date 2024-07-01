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

import { Easing, Tween } from '@tweenjs/tween.js'
import { AdditiveBlending, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, Vector3 } from 'three'

import { World } from '@dimforge/rapier3d-compat'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { ObjectDirection, Vector3_Right, Vector3_Up } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { Physics, RaycastArgs } from '@etherealengine/spatial/src/physics/classes/Physics'
import { AvatarCollisionMask, CollisionGroups } from '@etherealengine/spatial/src/physics/enums/CollisionGroups'
import { getInteractionGroups } from '@etherealengine/spatial/src/physics/functions/getInteractionGroups'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { SceneQueryType } from '@etherealengine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent, setVisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'
import { EntityTreeComponent } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { TweenComponent } from '@etherealengine/spatial/src/transform/components/TweenComponent'

export const SpawnEffectComponent = defineComponent({
  name: 'SpawnEffectComponent',
  onInit: (entity) => {
    return {
      sourceEntity: UndefinedEntity,
      opacityMultiplier: 1,
      plateEntity: UndefinedEntity,
      lightEntities: [] as Entity[]
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return

    if (json.sourceEntity) component.sourceEntity.set(json.sourceEntity)
    if (json.opacityMultiplier) component.opacityMultiplier.set(json.opacityMultiplier)
  },

  reactor: () => {
    const entity = useEntityContext()
    const physicsWorld = useMutableState(PhysicsState).physicsWorld

    useImmediateEffect(() => {
      const world = physicsWorld.value as World | null
      if (!world) return

      const effectComponent = getComponent(entity, SpawnEffectComponent)
      const sourceTransform = getComponent(effectComponent.sourceEntity, TransformComponent)
      /** Copy transform but do not attach to avatar */
      setComponent(entity, TransformComponent, { position: sourceTransform.position.clone() })
      const transform = getComponent(entity, TransformComponent)
      setComponent(entity, VisibleComponent, true)
      /** cast ray to move this downward to be on the ground */
      downwardGroundRaycast.origin.copy(sourceTransform.position)
      const hits = Physics.castRay(world, downwardGroundRaycast)
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
    }, [physicsWorld])

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
    transform.position.y += 0.5 * ray.geometry.boundingSphere?.radius! * Math.random()
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

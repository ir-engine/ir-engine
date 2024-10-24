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

import { RigidBodyType, ShapeType } from '@dimforge/rapier3d-compat'
import { useLayoutEffect } from 'react'
import { Mesh } from 'three'
import matches from 'ts-matches'

import { EntityUUID } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent as NewColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { CollisionGroups, DefaultCollisionMask } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import {
  Body,
  BodyTypes,
  ColliderDescOptions,
  ColliderOptions,
  OldShapeTypes
} from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode, useChildWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { computeTransformMatrix, updateGroupChildren } from '@ir-engine/spatial/src/transform/systems/TransformSystem'

import { GLTFLoadedComponent } from './GLTFLoadedComponent'

/** @deprecated - use the new API */
export const OldColliderComponent = defineComponent({
  name: 'OldColliderComponent',
  jsonID: 'collider',

  onInit(entity) {
    return {
      bodyType: RigidBodyType.Fixed,
      shapeType: ShapeType.Cuboid,
      isTrigger: false,
      /**
       * removeMesh will clean up any objects in the scene hierarchy after the collider bodies have been processed.
       *   This can be used to reduce CPU load by only persisting colliders in the physics simulation.
       */
      removeMesh: false,
      collisionLayer: CollisionGroups.Default,
      collisionMask: DefaultCollisionMask,
      restitution: 0.5,
      triggers: [
        {
          /**
           * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
           */
          onEnter: null as null | string | undefined,
          /**
           * The function to call on the CallbackComponent of the targetEntity when the trigger volume is exited.
           */
          onExit: null as null | string | undefined,
          /**
           * uuid (null as null | string)
           *
           * empty string represents self
           *
           * TODO: how do we handle non-scene entities?
           */
          target: null as null | EntityUUID | undefined
        }
      ]
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.bodyType === 'number') component.bodyType.set(json.bodyType)
    if (typeof json.shapeType === 'number') component.shapeType.set(json.shapeType)
    if (typeof json.isTrigger === 'boolean' || typeof json.isTrigger === 'number')
      component.isTrigger.set(Boolean(json.isTrigger))
    if (typeof json.removeMesh === 'boolean' || typeof json.removeMesh === 'number')
      component.removeMesh.set(Boolean(json.removeMesh))
    if (typeof json.collisionLayer === 'number') component.collisionLayer.set(json.collisionLayer)
    if (typeof json.collisionMask === 'number') component.collisionMask.set(json.collisionMask)
    if (typeof json.restitution === 'number') component.restitution.set(json.restitution)

    // backwards compatibility
    const onEnter = (json as any).onEnter ?? null
    const onExit = (json as any).onExit ?? null
    const target = (json as any).target ?? null
    if (!!onEnter || !!onExit || !!target) {
      component.triggers.set([{ onEnter, onExit, target }])
    } else if (typeof json.triggers === 'object') {
      if (
        matches
          .arrayOf(
            matches.shape({
              onEnter: matches.nill.orParser(matches.string),
              onExit: matches.nill.orParser(matches.string),
              target: matches.nill.orParser(matches.string)
            })
          )
          .test(json.triggers)
      ) {
        component.triggers.set(json.triggers)
      }
    }
  },

  toJSON: (component) => {
    return {
      bodyType: component.bodyType,
      shapeType: component.shapeType,
      isTrigger: component.isTrigger,
      removeMesh: component.removeMesh,
      collisionLayer: component.collisionLayer,
      collisionMask: component.collisionMask,
      restitution: component.restitution,
      triggers: component.triggers
    }
  },

  reactor: function () {
    const entity = useEntityContext()

    const transformComponent = useComponent(entity, TransformComponent)
    const colliderComponent = useComponent(entity, OldColliderComponent)
    const isLoadedFromGLTF = useOptionalComponent(entity, GLTFLoadedComponent)
    const groupComponent = useOptionalComponent(entity, GroupComponent)
    const tree = useChildWithComponents(entity, [MeshComponent])

    useLayoutEffect(() => {
      setComponent(entity, InputComponent)

      const isMeshCollider = [ShapeType.TriMesh, ShapeType.ConvexPolyhedron].includes(colliderComponent.shapeType.value)

      if (isLoadedFromGLTF?.value || isMeshCollider) {
        const colliderComponent = getComponent(entity, OldColliderComponent)

        iterateEntityNode(entity, computeTransformMatrix)
        if (hasComponent(entity, GroupComponent)) {
          updateGroupChildren(entity)
        }

        const meshesToRemove = [] as Mesh[]

        const colliderDescOptions = {
          bodyType: colliderComponent.bodyType,
          shapeType: colliderComponent.shapeType,
          isTrigger: colliderComponent.isTrigger,
          collisionLayer: colliderComponent.collisionLayer,
          collisionMask: colliderComponent.collisionMask,
          restitution: colliderComponent.restitution
        }

        const rigidBodyType =
          typeof colliderComponent.bodyType === 'string'
            ? RigidBodyType[colliderComponent.bodyType]
            : colliderComponent.bodyType

        let type: Body
        switch (rigidBodyType) {
          default:
          case RigidBodyType.Fixed:
            type = BodyTypes.Fixed
            break

          case RigidBodyType.Dynamic:
            type = BodyTypes.Dynamic
            break

          case RigidBodyType.KinematicPositionBased:
          case RigidBodyType.KinematicVelocityBased:
            type = BodyTypes.Kinematic
            break
        }

        setComponent(entity, RigidBodyComponent, { type })

        iterateEntityNode(entity, (child) => {
          const mesh = getOptionalComponent(child, MeshComponent)
          if (!mesh) return // || ((mesh?.geometry.attributes['position'] as BufferAttribute).array.length ?? 0 === 0)) return
          if (mesh.userData.type && mesh.userData.type !== ('glb' as any)) mesh.userData.shapeType = mesh.userData.type

          const args = { ...colliderDescOptions, ...mesh.userData } as ColliderOptions & ColliderDescOptions
          if (args.shapeType) args.shape = OldShapeTypes[args.shapeType]
          if (args.isTrigger) setComponent(child, TriggerComponent)
          setComponent(child, NewColliderComponent, args)

          meshesToRemove.push(mesh)
        })
      } else {
        /**
         * If rigidbody does not exist, create one
         */
        let type: Body
        switch (colliderComponent.bodyType.value) {
          default:
          case RigidBodyType.Fixed:
            type = BodyTypes.Fixed
            break
          case RigidBodyType.Dynamic:
            type = BodyTypes.Dynamic
            break
          case RigidBodyType.KinematicPositionBased:
          case RigidBodyType.KinematicVelocityBased:
            type = BodyTypes.Kinematic
            break
        }
        setComponent(entity, RigidBodyComponent, { type })

        removeComponent(entity, NewColliderComponent)

        setComponent(entity, NewColliderComponent, {
          shape: OldShapeTypes[colliderComponent.shapeType.value],
          collisionLayer: colliderComponent.collisionLayer.value,
          collisionMask: colliderComponent.collisionMask.value,
          restitution: colliderComponent.restitution.value
        })

        if (colliderComponent.isTrigger.value) {
          setComponent(entity, TriggerComponent)
        } else {
          removeComponent(entity, TriggerComponent)
        }
      }
    }, [isLoadedFromGLTF, colliderComponent, transformComponent, groupComponent?.length, tree])

    return null
  }
})

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

import { useEffect } from 'react'
import { Vector3 } from 'three'

import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { entityExists, removeEntity, useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getState, useImmediateEffect } from '@ir-engine/hyperflux'
import { FollowCameraComponent } from '@ir-engine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@ir-engine/spatial/src/camera/components/TargetCameraRotationComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { CameraComponent } from '../../../../spatial/src/camera/components/CameraComponent'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { setAvatarColliderTransform } from '../functions/spawnAvatarReceptor'
import { AvatarComponent } from './AvatarComponent'

export const eyeOffset = 0.25

export const AvatarControllerComponent = defineComponent({
  name: 'AvatarControllerComponent',

  schema: S.Object({
    /** The camera entity that should be updated by this controller */
    cameraEntity: T.Entity(),
    movementCaptured: S.Array(T.Entity()),
    isJumping: S.Bool(false),
    isWalking: S.Bool(false),
    isInAir: S.Bool(false),
    /** velocity along the Y axis */
    verticalVelocity: S.Number(0),
    /** Is the gamepad-driven jump active */
    gamepadJumpActive: S.Bool(false),
    /** gamepad-driven input, in the local XZ plane */
    gamepadLocalInput: T.Vec3(),
    /** gamepad-driven movement, in the world XZ plane */
    gamepadWorldMovement: T.Vec3()
  }),

  captureMovement(capturedEntity: Entity, entity: Entity): void {
    const component = getComponent(capturedEntity, AvatarControllerComponent)
    if (component.movementCaptured.indexOf(entity) !== -1) return
    component.movementCaptured.push(entity)
  },

  releaseMovement(capturedEntity: Entity, entity: Entity): void {
    const component = getComponent(capturedEntity, AvatarControllerComponent)
    const index = component.movementCaptured.indexOf(entity)
    if (index !== -1) component.movementCaptured.splice(index, 1)
  },

  reactor: () => {
    const entity = useEntityContext()
    const avatarComponent = useOptionalComponent(entity, AvatarComponent)
    const avatarControllerComponent = useComponent(entity, AvatarControllerComponent)
    const isCameraAttachedToAvatar = XRState.useCameraAttachedToAvatar()
    const camera = useComponent(Engine.instance.cameraEntity, CameraComponent)
    const world = Physics.useWorld(entity)
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)

    useImmediateEffect(() => {
      avatarControllerComponent.cameraEntity.set(getState(EngineState).viewerEntity || UndefinedEntity)
    }, [])

    useEffect(() => {
      if (!gltfComponent) return

      if (gltfComponent.progress.value !== 100) {
        AvatarControllerComponent.captureMovement(entity, entity)
      } else {
        AvatarControllerComponent.releaseMovement(entity, entity)
      }
    }, [gltfComponent?.progress?.value])

    useEffect(() => {
      if (!world) return
      Physics.createCharacterController(world, entity, {})
      world.cameraAttachedRigidbodyEntity = entity
      return () => {
        world.cameraAttachedRigidbodyEntity = UndefinedEntity
        Physics.removeCharacterController(world, entity)
      }
    }, [world])

    useEffect(() => {
      if (!avatarComponent) return
      setAvatarColliderTransform(entity)

      const cameraEntity = avatarControllerComponent.cameraEntity.value
      if (cameraEntity && entityExists(cameraEntity) && hasComponent(cameraEntity, FollowCameraComponent)) {
        const cameraComponent = getComponent(cameraEntity, FollowCameraComponent)
        cameraComponent.firstPersonOffset.set(0, avatarComponent.eyeHeight.value, eyeOffset)
        cameraComponent.thirdPersonOffset.set(0, avatarComponent.eyeHeight.value, 0)
      }
    }, [avatarComponent?.avatarHeight, camera.near])

    useEffect(() => {
      if (!avatarComponent) return
      if (isCameraAttachedToAvatar) {
        const controller = getComponent(entity, AvatarControllerComponent)
        removeComponent(controller.cameraEntity, FollowCameraComponent)
      } else {
        const controller = getComponent(entity, AvatarControllerComponent)
        const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
        setComponent(controller.cameraEntity, FollowCameraComponent, {
          targetEntity: entity,
          phi: targetCameraRotation.phi,
          theta: targetCameraRotation.theta,
          firstPersonOffset: new Vector3(0, avatarComponent.eyeHeight.value, eyeOffset),
          thirdPersonOffset: new Vector3(0, avatarComponent.eyeHeight.value, 0)
        })
      }
    }, [isCameraAttachedToAvatar, avatarComponent])

    return null
  }
})

export const AvatarColliderComponent = defineComponent({
  name: 'AvatarColliderComponent',
  schema: S.Object({ colliderEntity: T.Entity() }),

  reactor() {
    const entity = useEntityContext()
    const avatarColliderComponent = getComponent(entity, AvatarColliderComponent)
    useEffect(() => {
      return () => {
        removeEntity(
          avatarColliderComponent.colliderEntity
        ) /** @todo Aidan said to figure out why this isn't cleaned up with EntityTree */
      }
    }, [])
  }
})

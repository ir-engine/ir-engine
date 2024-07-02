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

import { useEffect } from 'react'
import { Vector3 } from 'three'

import {
  defineComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { entityExists, useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import {
  getMutableState,
  getState,
  matches,
  useHookstate,
  useImmediateEffect,
  useMutableState
} from '@etherealengine/hyperflux'
import { FollowCameraComponent } from '@etherealengine/spatial/src/camera/components/FollowCameraComponent'
import { TargetCameraRotationComponent } from '@etherealengine/spatial/src/camera/components/TargetCameraRotationComponent'
import { PhysicsState } from '@etherealengine/spatial/src/physics/state/PhysicsState'
import { XRControlsState } from '@etherealengine/spatial/src/xr/XRState'

import { World } from '@dimforge/rapier3d-compat'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { Physics } from '@etherealengine/spatial/src/physics/classes/Physics'
import { CameraComponent } from '../../../../spatial/src/camera/components/CameraComponent'
import { setAvatarColliderTransform } from '../functions/spawnAvatarReceptor'
import { AvatarComponent } from './AvatarComponent'

export const eyeOffset = 0.25

export const AvatarControllerComponent = defineComponent({
  name: 'AvatarControllerComponent',

  onInit(entity) {
    return {
      /** The camera entity that should be updated by this controller */
      cameraEntity: getState(EngineState).viewerEntity || UndefinedEntity,
      movementCaptured: [] as Array<Entity>,
      isJumping: false,
      isWalking: false,
      isInAir: false,
      /** velocity along the Y axis */
      verticalVelocity: 0,
      /** Is the gamepad-driven jump active */
      gamepadJumpActive: false,
      /** gamepad-driven input, in the local XZ plane */
      gamepadLocalInput: new Vector3(),
      /** gamepad-driven movement, in the world XZ plane */
      gamepadWorldMovement: new Vector3()
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (matches.number.test(json.cameraEntity)) component.cameraEntity.set(json.cameraEntity)
    if (matches.array.test(json.movementCaptured)) component.movementCaptured.set(json.movementCaptured)
    if (matches.boolean.test(json.isJumping)) component.isJumping.set(json.isJumping)
    if (matches.boolean.test(json.isWalking)) component.isWalking.set(json.isWalking)
    if (matches.boolean.test(json.isInAir)) component.isInAir.set(json.isInAir)
    if (matches.number.test(json.verticalVelocity)) component.verticalVelocity.set(json.verticalVelocity)
    if (matches.boolean.test(json.gamepadJumpActive)) component.gamepadJumpActive.set(json.gamepadJumpActive)
    if (matches.object.test(json.gamepadLocalInput)) component.gamepadLocalInput.set(json.gamepadLocalInput)
    if (matches.object.test(json.gamepadWorldMovement)) component.gamepadWorldMovement.set(json.gamepadWorldMovement)
  },

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
    const avatarComponent = useComponent(entity, AvatarComponent)
    const avatarControllerComponent = useComponent(entity, AvatarControllerComponent)
    const isCameraAttachedToAvatar = useHookstate(getMutableState(XRControlsState).isCameraAttachedToAvatar)
    const camera = useComponent(Engine.instance.cameraEntity, CameraComponent)
    const physicsWorld = useMutableState(PhysicsState).physicsWorld

    useImmediateEffect(() => {
      const world = physicsWorld.value as World | null
      if (!world) return
      Physics.createCharacterController(entity, world, {})
    }, [physicsWorld])

    useEffect(() => {
      setAvatarColliderTransform(entity)

      const cameraEntity = avatarControllerComponent.cameraEntity.value
      if (cameraEntity && entityExists(cameraEntity) && hasComponent(cameraEntity, FollowCameraComponent)) {
        const cameraComponent = getComponent(cameraEntity, FollowCameraComponent)
        cameraComponent.firstPersonOffset.set(0, avatarComponent.eyeHeight.value, eyeOffset)
        cameraComponent.thirdPersonOffset.set(0, avatarComponent.eyeHeight.value, 0)
      }
    }, [avatarComponent.avatarHeight, camera.near])

    useEffect(() => {
      if (isCameraAttachedToAvatar.value) {
        const controller = getComponent(entity, AvatarControllerComponent)
        removeComponent(controller.cameraEntity, FollowCameraComponent)
      } else {
        const controller = getComponent(entity, AvatarControllerComponent)
        const targetCameraRotation = getComponent(controller.cameraEntity, TargetCameraRotationComponent)
        setComponent(controller.cameraEntity, FollowCameraComponent, {
          targetEntity: entity,
          phi: targetCameraRotation.phi,
          theta: targetCameraRotation.theta
        })
      }
    }, [isCameraAttachedToAvatar])

    useEffect(() => {
      getMutableState(PhysicsState).cameraAttachedRigidbodyEntity.set(entity)
      return () => {
        getMutableState(PhysicsState).cameraAttachedRigidbodyEntity.set(UndefinedEntity)
      }
    }, [])

    return null
  }
})

export const AvatarColliderComponent = defineComponent({
  name: 'AvatarColliderComponent',
  onInit(entity) {
    return {
      colliderEntity: UndefinedEntity
    }
  },
  onSet(entity, component, json) {
    if (!json) return
    if (matches.number.test(json.colliderEntity)) component.colliderEntity.set(json.colliderEntity)
  }
})

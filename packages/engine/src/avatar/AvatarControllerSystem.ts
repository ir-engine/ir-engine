import { Quaternion, Vector3 } from 'three'
import { ControllerHitEvent, PhysXInstance } from 'three-physx'
import { defineQuery, enterQuery, exitQuery } from 'bitecs'
import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { moveAvatar } from './functions/moveAvatar'
import { detectUserInPortal } from './functions/detectUserInPortal'
import { World } from '../ecs/classes/World'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  walkSpeed = 1.5
  runSpeed = 5
  jumpHeight = 4
}

export default async function AvatarControllerSystem(world: World): Promise<System> {
  const vector3 = new Vector3()
  const quat = new Quaternion()
  const quat2 = new Quaternion()

  const controllerQuery = defineQuery([AvatarControllerComponent])
  const avatarControllerRemovedQuery = exitQuery(controllerQuery)

  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])
  const localXRInputQueryAddQuery = enterQuery(localXRInputQuery)
  const localXRInputQueryRemoveQuery = exitQuery(localXRInputQuery)

  return () => {
    const { delta } = world

    for (const entity of avatarControllerRemovedQuery(world)) {
      const controller = getComponent(entity, AvatarControllerComponent, true)

      if (controller?.controller) {
        PhysXInstance.instance.removeController(controller.controller)
      }

      const avatar = getComponent(entity, AvatarComponent)
      if (avatar) {
        avatar.isGrounded = false
      }
    }

    for (const entity of localXRInputQueryAddQuery(world)) {
      const avatar = getComponent(entity, AvatarComponent)

      // TODO: Temporarily make rig invisible until rig is fixed
      avatar.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = false
        }
      })
    }

    for (const entity of localXRInputQueryRemoveQuery(world)) {
      const avatar = getComponent(entity, AvatarComponent)
      // TODO: Temporarily make rig invisible until rig is fixed
      avatar?.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = true
        }
      })
    }

    for (const entity of localXRInputQuery(world)) {
      const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
      const transform = getComponent(entity, TransformComponent)

      xrInputSourceComponent.container.updateWorldMatrix(true, true)
      xrInputSourceComponent.container.updateMatrixWorld(true)

      quat.copy(transform.rotation).invert()
      quat2.copy(Engine.camera.quaternion).premultiply(quat)
      xrInputSourceComponent.head.quaternion.copy(quat2)

      vector3.subVectors(Engine.camera.position, transform.position)
      vector3.applyQuaternion(quat)
      xrInputSourceComponent.head.position.copy(vector3)
    }

    for (const entity of controllerQuery(world)) {
      const controller = getComponent(entity, AvatarControllerComponent)

      // iterate on all collisions since the last update
      controller.controller.controllerCollisionEvents?.forEach((event: ControllerHitEvent) => {})

      const avatar = getComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)

      // reset if vals are invalid
      if (isNaN(controller.controller.transform.translation.x)) {
        console.warn('WARNING: Avatar physics data reporting NaN', controller.controller.transform.translation)
        controller.controller.updateTransform({
          translation: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0, w: 1 }
        })
      }

      transform.position.set(
        controller.controller.transform.translation.x,
        controller.controller.transform.translation.y - avatar.avatarHalfHeight,
        controller.controller.transform.translation.z
      )

      detectUserInPortal(entity)

      moveAvatar(entity, delta)
    }
    return world
  }
}

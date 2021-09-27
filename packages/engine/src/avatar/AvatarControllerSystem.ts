import { Quaternion, Vector3 } from 'three'
import { defineQuery, enterQuery, exitQuery } from 'bitecs'
import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { moveAvatar } from './functions/moveAvatar'
import { detectUserInPortal } from './functions/detectUserInPortal'
import { World } from '../ecs/classes/World'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { SpawnPoints } from './ServerAvatarSpawnSystem'
import { dispatchFromClient } from '../networking/functions/dispatch'
import { NetworkWorldAction } from '../networking/interfaces/NetworkWorldActions'
import { SpawnPoseComponent } from './components/SpawnPoseComponent'
import { respawnAvatar } from './functions/respawnAvatar'

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
        world.physics.removeController(controller.controller)
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

      const avatar = getComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)
      const pose = controller.controller.getPosition()

      transform.position.set(pose.x, pose.y - avatar.avatarHalfHeight, pose.z)

      detectUserInPortal(entity)

      moveAvatar(entity, delta)

      // TODO: implement scene lower bounds parameter
      if (transform.position.y < -10) {
        respawnAvatar(entity)
        continue
      }
    }
    return world
  }
}

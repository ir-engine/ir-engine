import { Quaternion, Vector3 } from 'three'
import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRInputSourceComponent } from './components/XRInputSourceComponent'
import { moveAvatar } from './functions/moveAvatar'
import { detectUserInCollisions } from './functions/detectUserInCollisions'
import { World } from '../ecs/classes/World'
import { NetworkObjectComponent } from '../networking/components/NetworkObjectComponent'
import { dispatchFrom } from '../networking/functions/dispatchFrom'
import { SpawnPoseComponent } from './components/SpawnPoseComponent'
import { respawnAvatar } from './functions/respawnAvatar'
import { ColliderComponent } from '../physics/components/ColliderComponent'

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
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])

  return () => {
    for (const entity of controllerQuery.exit(world)) {
      const controller = getComponent(entity, AvatarControllerComponent)

      if (controller?.controller) {
        world.physics.removeController(controller.controller)
      }

      const avatar = getComponent(entity, AvatarComponent)
      if (avatar) {
        avatar.isGrounded = false
      }
    }

    for (const entity of localXRInputQuery.enter(world)) {
      const avatar = getComponent(entity, AvatarComponent)

      // TODO: Temporarily make rig invisible until rig is fixed
      avatar.modelContainer?.traverse((child) => {
        if (child.visible) {
          child.visible = false
        }
      })
    }

    for (const entity of localXRInputQuery.exit(world)) {
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
      // todo: replace this with trigger detection
      detectUserInCollisions(entity)

      moveAvatar(world, entity, Engine.camera)

      const controller = getComponent(entity, AvatarControllerComponent)
      const collider = getComponent(entity, ColliderComponent)

      const avatar = getComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)

      const pose = controller.controller.getPosition()
      transform.position.set(pose.x, pose.y - avatar.avatarHalfHeight, pose.z)

      collider.body.setGlobalPose(
        {
          translation: pose,
          rotation: transform.rotation
        },
        true
      )

      // TODO: implement scene lower bounds parameter
      if (transform.position.y < -10) {
        respawnAvatar(entity)
        continue
      }
    }
    return world
  }
}

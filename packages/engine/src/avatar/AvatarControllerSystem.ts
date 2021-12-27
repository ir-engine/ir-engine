import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { moveAvatar } from './functions/moveAvatar'
import { World } from '../ecs/classes/World'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  walkSpeed = 1.5
  runSpeed = 5
  jumpHeight = 4
}

export default async function AvatarControllerSystem(world: World): Promise<System> {
  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])

  return () => {
    for (const entity of controllerQuery.exit(world)) {
      const controller = getComponent(entity, AvatarControllerComponent, true)

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
      if (avatar.modelContainer) {
        avatar.modelContainer.visible = false
      }
    }

    for (const entity of localXRInputQuery.exit(world)) {
      const avatar = getComponent(entity, AvatarComponent, true)
      // TODO: Temporarily make rig invisible until rig is fixed
      if (avatar.modelContainer) {
        avatar.modelContainer.visible = true
      }
    }

    for (const entity of controllerQuery(world)) {
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
        // respawnAvatar(entity)
        continue
      }
    }
    return world
  }
}

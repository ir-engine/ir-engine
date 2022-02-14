import { Quaternion, Vector3 } from 'three'
import { Engine } from '../ecs/classes/Engine'
//import { System } from '../ecs/classes/System'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { moveAvatar } from './functions/moveAvatar'
import { World } from '../ecs/classes/World'
import { respawnAvatar } from './functions/respawnAvatar'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { detectUserInCollisions } from './functions/detectUserInCollisions'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  walkSpeed = 1.5
  runSpeed = 10
  jumpHeight = 20
  isPortal = false
  portal = new Vector3(0, 0, 0)
}

export default async function AvatarControllerSystem(world: World) {
  const vector3 = new Vector3()
  const quat = new Quaternion()
  const quat2 = new Quaternion()

  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])

  return () => {
    //console.log("Updating Avaatr")
    for (const entity of controllerQuery.exit(world)) {
      const controller = getComponent(entity, AvatarControllerComponent, true)

      if (controller?.controller) {
        world.physics.removeController(controller.controller)
      }

      const avatar = getComponent(entity, AvatarComponent)
      if (avatar) {
        ;``
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
      // todo: replace this with trigger detection
      detectUserInCollisions(entity)

      moveAvatar(world, entity, Engine.camera)

      const controller = getComponent(entity, AvatarControllerComponent)
      const collider = getComponent(entity, ColliderComponent)

      const avatar = getComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)

      const pose = controller.controller.getPosition()

      pose.x += AvatarSettings.instance.portal.x
      pose.y += AvatarSettings.instance.portal.y
      pose.z += AvatarSettings.instance.portal.z

      if (controller.movementEnabled) {
        transform.position.set(pose.x, pose.y - avatar.avatarHalfHeight, pose.z)
        collider.body.setGlobalPose(
          {
            translation: pose,
            rotation: transform.rotation
          },
          true
        )

        if (AvatarSettings.instance.isPortal) {
          AvatarSettings.instance.isPortal = false
          AvatarSettings.instance.portal = new Vector3(0, 0, 0)
        }
      }

      controller.controller.setPosition(pose)

      // TODO: implement scene lower bounds parameter
      if (transform.position.y < -10) {
        // respawnAvatar(entity)
        continue
      }
    }
    return world
  }
}

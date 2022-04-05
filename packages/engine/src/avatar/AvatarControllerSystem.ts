import { Vector3 } from 'three'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { AvatarMovementScheme } from '../input/enums/InputEnums'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { setAvatarHeadOpacity } from './functions/avatarFunctions'
import { moveAvatar, moveXRAvatar, rotateXRAvatar } from './functions/moveAvatar'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  // Speeds are same as animation's root motion
  walkSpeed = 1.6762927669761485
  runSpeed = 3.769894125544925
  jumpHeight = 4
  movementScheme = Engine.isHMD ? AvatarMovementScheme.Teleport : AvatarMovementScheme.Linear
}

export default async function AvatarControllerSystem(world: World) {
  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])

  const lastCamPos = new Vector3(),
    displacement = new Vector3()

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

    for (const entity of localXRInputQuery(world)) {
      setAvatarHeadOpacity(entity, 0)
      moveXRAvatar(world, entity, Engine.camera, lastCamPos, displacement)
      rotateXRAvatar(world, entity, Engine.camera)
    }

    for (const entity of controllerQuery(world)) {
      const displace = moveAvatar(world, entity, Engine.camera)
      displacement.set(displace.x, displace.y, displace.z)

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

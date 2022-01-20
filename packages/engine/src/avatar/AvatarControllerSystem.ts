import { Engine } from '../ecs/classes/Engine'
import { System } from '../ecs/classes/System'
import { defineQuery, getComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import {
  alignXRCameraPositionWithAvatar,
  alignXRCameraRotationWithAvatar,
  moveAvatar,
  moveXRAvatar,
  rotateXRAvatar
} from './functions/moveAvatar'
import { World } from '../ecs/classes/World'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { setAvatarHeadOpacity } from './functions/avatarFunctions'
import { Vector3 } from 'three'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  walkSpeed = 1.5
  runSpeed = 5
  jumpHeight = 4
}

export default async function AvatarControllerSystem(world: World): Promise<System> {
  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])

  const tempVec = new Vector3()
  const lastCamPos = new Vector3()
  let localCameraInitialized = false

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
      // TODO: The opacity value does not set immidiately
      setTimeout(() => setAvatarHeadOpacity(entity, 0), 1000)

      // The Engine.camera.position has an update delay
      setTimeout(() => {
        tempVec.subVectors(Engine.camera.position, Engine.camera.parent!.position)

        alignXRCameraPositionWithAvatar(entity, Engine.camera)
        alignXRCameraRotationWithAvatar(entity, Engine.camera)

        // Calculate new camera world position
        tempVec.add(Engine.camera.parent!.position)

        Engine.camera.position.copy(tempVec)
        lastCamPos.copy(tempVec)
        localCameraInitialized = true
      }, world.fixedDelta * 2000) // 2 frames
    }

    for (const entity of localXRInputQuery.exit(world)) {
      localCameraInitialized = false
    }

    for (const entity of localXRInputQuery(world)) {
      if (localCameraInitialized) {
        moveXRAvatar(world, entity, Engine.camera, lastCamPos)
        rotateXRAvatar(world, entity, Engine.camera)
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

import { Quaternion, Vector3 } from 'three'

import { addActionReceptor } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { BaseInput } from '../input/enums/BaseInput'
import { AvatarMovementScheme } from '../input/enums/InputEnums'
import { XRAxes } from '../input/enums/InputEnums'
import { ColliderComponent } from '../physics/components/ColliderComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRInputSourceComponent } from '../xr/components/XRInputSourceComponent'
import { AvatarInputSchema } from './AvatarInputSchema'
import { AvatarComponent } from './components/AvatarComponent'
import { AvatarControllerComponent } from './components/AvatarControllerComponent'
import { XRCameraRotateYComponent } from './components/XRCameraRotateYComponent'
import { setAvatarHeadOpacity } from './functions/avatarFunctions'
import { detectUserInCollisions } from './functions/detectUserInCollisions'
import { alignXRCameraPositionWithAvatar, moveAvatar, moveXRAvatar, rotateXRAvatar } from './functions/moveAvatar'
import { respawnAvatar } from './functions/respawnAvatar'
import { accessAvatarInputSettingsState, AvatarInputSettingsReceptor } from './state/AvatarInputSettingsState'

export class AvatarSettings {
  static instance: AvatarSettings = new AvatarSettings()
  // Speeds are same as animation's root motion
  walkSpeed = 1.6762927669761485
  runSpeed = 3.769894125544925 * 1.5
  jumpHeight = 4
  movementScheme = AvatarMovementScheme.Linear
}

export default async function AvatarControllerSystem(world: World) {
  const controllerQuery = defineQuery([AvatarControllerComponent])
  const localXRInputQuery = defineQuery([LocalInputTagComponent, XRInputSourceComponent, AvatarControllerComponent])
  const cameraRotationQuery = defineQuery([XRCameraRotateYComponent])

  addActionReceptor(AvatarInputSettingsReceptor)

  const lastCamPos = new Vector3(),
    displacement = new Vector3(),
    camRotation = new Quaternion(),
    up = new Vector3(0, 1, 0)

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
      if (!hasComponent(entity, XRCameraRotateYComponent)) {
        moveXRAvatar(world, entity, Engine.instance.currentWorld.camera, lastCamPos, displacement)
        rotateXRAvatar(world, entity, Engine.instance.currentWorld.camera)
      }
    }

    for (const entity of cameraRotationQuery.exit(world)) {
      const camera = Engine.instance.currentWorld.camera
      lastCamPos.subVectors(camera.position, camera.parent!.position)
      alignXRCameraPositionWithAvatar(entity, Engine.instance.currentWorld.camera)
      lastCamPos.add(camera.parent!.position)
    }

    for (const entity of cameraRotationQuery.enter(world)) {
      const avatarTransform = getComponent(entity, TransformComponent)
      const rotation = getComponent(entity, XRCameraRotateYComponent)
      const cam = Engine.instance.currentWorld.camera
      const camParent = cam.parent!

      camRotation.setFromAxisAngle(up, rotation.angle)
      avatarTransform.rotation.premultiply(camRotation)
      camParent.quaternion.premultiply(camRotation)
      camParent.position.copy(cam.position).multiplyScalar(-1)

      removeComponent(entity, XRCameraRotateYComponent)
    }

    for (const entity of controllerQuery(world)) {
      const displace = moveAvatar(world, entity, Engine.instance.currentWorld.camera)
      displacement.set(displace.x, displace.y, displace.z)

      const controller = getComponent(entity, AvatarControllerComponent)
      const collider = getComponent(entity, ColliderComponent)

      const avatar = getComponent(entity, AvatarComponent)
      const transform = getComponent(entity, TransformComponent)

      const pose = controller.controller.getPosition()
      transform.position.set(pose.x, pose.y - avatar.avatarHalfHeight, pose.z)

      detectUserInCollisions(entity)

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

export const updateMap = () => {
  const avatarInputState = accessAvatarInputSettingsState()
  const inputMap = AvatarInputSchema.inputMap
  if (avatarInputState.invertRotationAndMoveSticks.value) {
    inputMap.set(XRAxes.Left, BaseInput.XR_AXIS_LOOK)
    inputMap.set(XRAxes.Right, BaseInput.XR_AXIS_MOVE)
  } else {
    inputMap.set(XRAxes.Left, BaseInput.XR_AXIS_MOVE)
    inputMap.set(XRAxes.Right, BaseInput.XR_AXIS_LOOK)
  }
}

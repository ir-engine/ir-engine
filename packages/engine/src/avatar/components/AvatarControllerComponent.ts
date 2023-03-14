import { Collider, KinematicCharacterController } from '@dimforge/rapier3d-compat'
import { Vector3 } from 'three'

import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AvatarControllerComponent = defineComponent({
  name: 'AvatarControllerComponent',

  onInit(entity) {
    return {
      /** The camera entity that should be updated by this controller */
      cameraEntity: Engine.instance.cameraEntity,
      controller: null! as KinematicCharacterController,
      bodyCollider: null! as Collider,
      movementEnabled: true,
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
      gamepadWorldMovement: new Vector3(),
      // Below two values used to smoothly transition between
      // walk and run speeds
      /** @todo refactor animation system */
      speedVelocity: { value: 0 },
      translationApplied: new Vector3()
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (matches.number.test(json.cameraEntity)) component.cameraEntity.set(json.cameraEntity)
    if (matches.object.test(json.controller)) component.controller.set(json.controller as KinematicCharacterController)
    if (matches.object.test(json.bodyCollider)) component.bodyCollider.set(json.bodyCollider as Collider)
    if (matches.boolean.test(json.movementEnabled)) component.movementEnabled.set(json.movementEnabled)
    if (matches.boolean.test(json.isJumping)) component.isJumping.set(json.isJumping)
    if (matches.boolean.test(json.isWalking)) component.isWalking.set(json.isWalking)
    if (matches.boolean.test(json.isInAir)) component.isInAir.set(json.isInAir)
    if (matches.number.test(json.verticalVelocity)) component.verticalVelocity.set(json.verticalVelocity)
    if (matches.boolean.test(json.gamepadJumpActive)) component.gamepadJumpActive.set(json.gamepadJumpActive)
    if (matches.object.test(json.gamepadLocalInput)) component.gamepadLocalInput.set(json.gamepadLocalInput)
    if (matches.object.test(json.gamepadWorldMovement)) component.gamepadWorldMovement.set(json.gamepadWorldMovement)
    if (matches.object.test(json.speedVelocity)) component.speedVelocity.set(json.speedVelocity)
    if (matches.object.test(json.translationApplied)) component.translationApplied.set(json.translationApplied)
  }
})

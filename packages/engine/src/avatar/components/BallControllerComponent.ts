import { defineComponent } from '@ir-engine/ecs'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

export const BallControllerComponent = defineComponent({
  name: 'BallControllerComponent',

  schema: S.Object({
    moveSpeed: S.Number(10), // Base movement speed
    jumpForce: S.Number(15), // Force applied when jumping
    airControl: S.Number(0.3), // Multiplier for air movement control
    groundControl: S.Number(1), // Multiplier for ground movement control
    isGrounded: S.Bool(false), // Whether the ball is touching the ground
    maxSpeed: S.Number(20), // Maximum speed the ball can reach
    direction: T.Vec3(), // Current movement direction
    boostMultiplier: S.Number(1.5) // Speed multiplier when boost is active
  })
})

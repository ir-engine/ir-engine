import { MovementType } from '../animations/Util'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterComponent } from '../components/CharacterComponent'

export const calculateAnimationMovement = (
  actor: CharacterComponent,
  animationComponent: AnimationComponent,
  delta: number,
  EPSILON: number
): MovementType => {
  if (actor.moveVectorSmooth.position.length() < EPSILON) {
    actor.moveVectorSmooth.velocity.set(0, 0, 0)
    actor.moveVectorSmooth.position.set(0, 0, 0)
  }

  actor.moveVectorSmooth.target.copy(animationComponent.animationVelocity)
  actor.moveVectorSmooth.simulate(delta)
  const velocity = actor.moveVectorSmooth.position

  velocity.set(
    Math.abs(velocity.x) < EPSILON ? 0 : velocity.x,
    Math.abs(velocity.y) < EPSILON ? 0 : velocity.y,
    Math.abs(velocity.z) < EPSILON ? 0 : velocity.z
  )

  animationComponent.animationVectorSimulator.target.setY(actor.isGrounded ? 0 : 1)
  animationComponent.animationVectorSimulator.simulate(delta)
  const distanceFromGround =
    animationComponent.animationVectorSimulator.position.y < EPSILON
      ? 0
      : animationComponent.animationVectorSimulator.position.y

  return { velocity, distanceFromGround }
}

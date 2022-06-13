import { InteractionGroups } from '@dimforge/rapier3d-compat'

// Create a bit wise mask that conforms with RAPIER.InteractionGroups bit structure.
export const getInteractionGroups = (collisionGroup: number, collisionMask: number): InteractionGroups => {
  let interactionGroups = collisionGroup << 16
  interactionGroups |= collisionMask
  return interactionGroups
}

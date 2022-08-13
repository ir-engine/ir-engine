import { Entity } from '../../ecs/classes/Entity'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderHitEvent } from '../../physics/types/PhysicsTypes'

export type CallbackComponentType = {
  [event: string]: (triggerEntity: Entity, hitEvent: ColliderHitEvent) => void
}

export const CallbackComponent = createMappedComponent<CallbackComponentType>('CallbackComponent')

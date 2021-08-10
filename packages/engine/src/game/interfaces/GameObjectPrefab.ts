import type { ColliderHitEvent } from 'three-physx'
import type { Entity } from '../../ecs/classes/Entity'
import type { GameObject } from '../components/GameObject'

export interface GameObjectPrefab {
  create: () => ReturnType<typeof GameObject.get>
  destroy: () => void
}

export type GameObjectInteractionBehavior = (entity: Entity, hitEvent: ColliderHitEvent, entityOther: Entity) => any

export interface GameObjectInteractionSchema {
  [x: string]: GameObjectInteractionBehavior
}

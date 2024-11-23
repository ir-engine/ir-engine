import { ColliderDesc } from '@dimforge/rapier3d-compat'
import { Entity, EntityUUID } from '@ir-engine/ecs'
import { defineState } from '@ir-engine/hyperflux'

export const NestedCollidersState = defineState({
  name: 'NestedCollidersState',
  initial: () => ({}) as Record<EntityUUID, Record<Entity, ColliderDesc>>
})

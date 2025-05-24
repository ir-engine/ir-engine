import { Component, Entity } from '@ir-engine/ecs'
import { defineState } from '@ir-engine/hyperflux'

export type ActiveHelperReactorProps = {
  entity: Entity
  selected: boolean
  hovered: boolean
}

export interface ActiveHelperRegistryEntry {
  reactor: React.FC<ActiveHelperReactorProps>
  icon: any
  component: Component
  directional?: boolean
  volume?: boolean
}

export const ActiveHelperRegistryState = defineState({
  name: 'ActiveHelperRegistryState',
  initial: {} as Record<string, ActiveHelperRegistryEntry>
})

import { Entity } from '../../ecs/classes/Entity'

export type InteractionCheckHandler = (
  clientEntity: Entity,
  interactiveEntity: Entity,
  focusedPart?: number,
  args?: any
) => boolean

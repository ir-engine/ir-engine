import { Behavior } from '../../../../common/interfaces/Behavior'
import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Interactable } from '../../../../interaction/components/Interactable'
import { getGame } from '../../../../game/functions/functions'
import { Engine } from '../../../../ecs/classes/Engine'

export const giveGoalState: Behavior = (
  entity: Entity,
  args?: any,
  delta?: number,
  entityTarget?: Entity,
  time?: number,
  checks?: any
): void => {
  const game = getGame(entity)
  const gameSchema = Engine.gameModes.get(game.gameMode)
  const nameObject = getComponent(entityTarget, Interactable).data.interactionText ?? '1'

  // TODO: check this is right
  const entityPlayer = game.gamePlayers[gameSchema.gamePlayerRoles[nameObject]][0]

  // TODO
  // addStateComponent( entityPlayer, Goal );
}

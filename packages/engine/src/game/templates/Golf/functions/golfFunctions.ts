import { Entity } from '../../../../ecs/classes/Entity'
import { getComponent } from '../../../../ecs/functions/EntityFunctions'
import { Network } from '../../../../networking/classes/Network'
import { NetworkObjectComponent } from '../../../../networking/components/NetworkObjectComponent'
import { GolfState } from '../GolfSystem'

export const getGolfPlayerNumber = (entity: Entity) => {
  const uniqueId = getComponent(entity, NetworkObjectComponent)?.uniqueId
  if (!uniqueId) return undefined
  const number = GolfState.players.findIndex((player) => player.id.value === uniqueId)
  if (number < 0) return undefined
  return number
}

export const isCurrentGolfPlayer = (entity: Entity) => {
  const currentPlayerNumber = GolfState.currentPlayer.value
  const currentPlayerId = GolfState.players.value[currentPlayerNumber].id
  return currentPlayerId === getComponent(entity, NetworkObjectComponent).uniqueId
}

export const getCurrentGolfPlayerEntity = () => {
  const currentPlayerNumber = GolfState.currentPlayer.value
  const currentPlayerId = GolfState.players.value[currentPlayerNumber].id
  return Object.values(Network.instance.networkObjects).find((obj) => obj.uniqueId === currentPlayerId)?.entity
}

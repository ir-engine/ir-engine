import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { NetworkObjectComponent } from '@xrengine/engine/src/networking/components/NetworkObjectComponent'
import { GolfState } from '../GolfSystem'

export const getGolfPlayerNumber = (entity: Entity = Network.instance.localClientEntity) => {
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

export const getOwnerIdPlayerNumber = (ownerId: string) => {
  const number = GolfState.players.findIndex((player) => player.id.value === ownerId)
  if (number < 0) return undefined
  return number
}

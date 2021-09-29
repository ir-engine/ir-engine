import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { UserdataComponent } from '@xrengine/engine/src/scene/components/UserdataComponent'
import { GolfState } from '../GolfSystem'

export const getGolfPlayerNumber = (userId: UserId = GolfState.currentPlayerId.value) => {
  return GolfState.players.findIndex((player) => player.userId.value === userId)
}

export function getGolfPlayerState(userId: UserId = GolfState.currentPlayerId.value) {
  return GolfState.players.find((player) => player.userId.value === userId)
}

export const isCurrentGolfPlayer = (userId: UserId) => {
  return userId === GolfState.currentPlayerId.value
}

export const getCurrentGolfPlayerEntity = () => {
  const currentPlayerId = GolfState.currentPlayerId.value
  return useWorld().getUserAvatarEntity(currentPlayerId)
}

export const getPlayerEntityFromNumber = (number: number) => {
  const playerId = GolfState.players[number].userId.value
  return useWorld().getUserAvatarEntity(playerId)
}

export function getBall(u: UserId) {
  const playerNumber = getGolfPlayerNumber(u)
  return useWorld().namedEntities.get(`GolfBall-${playerNumber}`)!
}
export function getClub(u: UserId) {
  const playerNumber = getGolfPlayerNumber(u)
  return useWorld().namedEntities.get(`GolfClub-${playerNumber}`)!
}

export function getTee(hole: number) {
  return useWorld().namedEntities.get(`GolfTee-${hole}`)!
}
export function getHole(hole: number) {
  return useWorld().namedEntities.get(`GolfHole-${hole}`)!
}

interface ITeeParData {
  data: { par: number }
}

export const getCoursePar = (currentHole): number => {
  const {
    data: { par }
  }: ITeeParData = getComponent(getTee(currentHole), UserdataComponent)
  return par
}

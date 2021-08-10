import { Entity } from '../../../../ecs/classes/Entity'
import { getStorage, setStorage } from '../../../../game/functions/functionsStorage'

export const saveGoalScore = (entity: Entity): void => {
  const gameScore = getStorage(entity, { name: 'GameScore' })
  gameScore.score.goal += 1
  setStorage(entity, { name: 'GameScore' }, gameScore)

  console.warn('/////////////////////////////////////')
  console.warn('/// SCORE // Hits: ' + gameScore.score.hits + ' // Goal: ' + gameScore.score.goal + ' ////////')
  console.warn('/////////////////////////////////////')
}

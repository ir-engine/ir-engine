import { Entity } from '../../ecs/classes/Entity'
import { Network } from '../classes/Network'

export const isEntityLocalClient = (entity: Entity) => {
  return typeof Network.instance.localClientEntity !== 'undefined' && Network.instance.localClientEntity === entity
}

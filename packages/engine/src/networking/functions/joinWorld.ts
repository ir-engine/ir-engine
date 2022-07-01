import { Engine } from '../../ecs/classes/Engine'
import { MessageTypes } from '../enums/MessageTypes'
import { JoinWorldRequestData, receiveJoinWorld } from './receiveJoinWorld'

/**
 * Sends a request to join the current world
 * @param transportRequestData
 */
export function joinCurrentWorld(transportRequestData: JoinWorldRequestData = {}) {
  Engine.instance.currentWorld.worldNetwork
    .request(MessageTypes.JoinWorld.toString(), transportRequestData)
    .then(receiveJoinWorld)
}

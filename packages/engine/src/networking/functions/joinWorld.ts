import { Engine } from '../../ecs/classes/Engine'
import { MessageTypes } from '../enums/MessageTypes'
import { receiveJoinWorld, receiveSpectateWorld } from './receiveJoinWorld'

/**
 * Sends a request to join the current world
 * @param transportRequestData
 */
export function joinCurrentWorld(transportRequestData: object = {}) {
  Engine.instance.currentWorld.worldNetwork
    .request(MessageTypes.JoinWorld.toString(), transportRequestData)
    .then(receiveJoinWorld)
}

/**
 * Sends a request to spectate the current world or a user
 * @param transportRequestData
 */
export function spectateCurrentWorld(transportRequestData: object = {}) {
  Engine.instance.currentWorld.worldNetwork
    .request(MessageTypes.SpectateWorld.toString(), transportRequestData)
    .then(receiveSpectateWorld)
}

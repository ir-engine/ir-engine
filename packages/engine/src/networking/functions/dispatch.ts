import { isClient } from '../../common/functions/isClient'
import { Network } from '../classes/Network'
import { ActionType } from '../interfaces/NetworkTransport'

/**
 * Dispatch an action on the server (noop on client)
 * @param action
 */
export const dispatchOnServer = (action: ActionType) => {
  // noop on client
  if (!isClient) Network.instance.outgoingActions.push(action)
}

/**
 * Dispatch an action on the client (noop on server)
 * @param action
 */
export const dispatchOnClient = (action: ActionType) => {
  // noop on server
  if (isClient) Network.instance.outgoingActions.push(action)
}

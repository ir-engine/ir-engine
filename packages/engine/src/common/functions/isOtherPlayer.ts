/** @returns Whether is Other Player or not. */
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { isClient } from './isClient'

export const isOtherPlayer = function (entity) {
  return isClient && getComponent(entity, NetworkObjectComponent).networkId != Network.instance.localAvatarNetworkId
}

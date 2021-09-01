import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { Vault } from '../classes/Vault'
import { defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'

export const ClientNetworkOutgoingSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    if (typeof Network.instance.localClientEntity !== 'undefined') {
      const inputSnapshot = Vault.instance?.get()
      if (inputSnapshot !== undefined) {
        const buffer = .toBuffer(Network.instance.worldState)
        Network.instance.transport.sendReliableData(buffer)

        Network.instance.worldState = {
          networkId: getComponent(Network.instance.localClientEntity, NetworkObjectComponent).networkId,
          pose: Network.instance.worldState.pose,
          head: Network.instance.worldState.head,
          leftHand: Network.instance.worldState.leftHand,
          rightHand: Network.instance.worldState.rightHand,
          transforms: []
        }
      }
    }

    return world
  })
}

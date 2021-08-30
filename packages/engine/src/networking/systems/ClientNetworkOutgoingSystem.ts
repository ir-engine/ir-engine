import { NetworkObjectComponent } from '../components/NetworkObjectComponent'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Network } from '../classes/Network'
import { ClientInputModel } from '../schema/clientInputSchema'
import { Vault } from '../classes/Vault'
import { defineSystem, System } from 'bitecs'
import { ECSWorld } from '../../ecs/classes/World'

export const ClientNetworkOutgoingSystem = async (): Promise<System> => {
  return defineSystem((world: ECSWorld) => {
    if (typeof Network.instance.localClientEntity !== 'undefined') {
      const inputSnapshot = Vault.instance?.get()
      if (inputSnapshot !== undefined) {
        const buffer = ClientInputModel.toBuffer(Network.instance.clientInputState)
        Network.instance.transport.sendReliableData(buffer)

        Network.instance.clientInputState = {
          networkId: getComponent(Network.instance.localClientEntity, NetworkObjectComponent).networkId,
          snapShotTime: inputSnapshot.time - Network.instance.timeSnaphotCorrection ?? 0,
          data: [],
          viewVector: Network.instance.clientInputState.viewVector,
          commands: [],
          transforms: []
        }
      }
    }

    return world
  })
}

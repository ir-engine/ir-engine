import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Network } from '../classes/Network'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const getLocalNetworkId = () => {
  return (
    typeof Network.instance.localClientEntity !== 'undefined' &&
    getComponent(Network.instance.localClientEntity, NetworkObjectComponent).networkId
  )
}

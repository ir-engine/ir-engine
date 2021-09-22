import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkObjectComponent } from '../components/NetworkObjectComponent'

export const getLocalNetworkId = () => {
  return getComponent(useWorld().localClientEntity, NetworkObjectComponent).networkId
}

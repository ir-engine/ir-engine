import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

type DelegatedInputReceiverComponentType = {
  networkId: number
}

export const DelegatedInputReceiverComponent = createMappedComponent<DelegatedInputReceiverComponentType>()
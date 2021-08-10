import { createMappedComponent } from '../../ecs/functions/EntityFunctions'

export type DelegatedInputReceiverComponentType = {
  networkId: number
}

export const DelegatedInputReceiverComponent = createMappedComponent<DelegatedInputReceiverComponentType>()

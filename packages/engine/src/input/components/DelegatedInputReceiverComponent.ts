import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type DelegatedInputReceiverComponentType = {
  networkId: number
}

export const DelegatedInputReceiverComponent = createMappedComponent<DelegatedInputReceiverComponentType>(
  'DelegatedInputReceiverComponent'
)

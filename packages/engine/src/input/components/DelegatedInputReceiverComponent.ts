import { createMappedComponent } from '../../ecs/ComponentFunctions'

export type DelegatedInputReceiverComponentType = {
  networkId: number
}

export const DelegatedInputReceiverComponent = createMappedComponent<DelegatedInputReceiverComponentType>(
  'DelegatedInputReceiverComponent'
)

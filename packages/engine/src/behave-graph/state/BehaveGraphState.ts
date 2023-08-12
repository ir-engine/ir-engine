import { IRegistry } from '@behave-graph/core'
import { defineState } from '@etherealengine/hyperflux'
import { GraphDomainID } from '../components/BehaveGraphComponent'

export type BehaveGraphDomainType = {
  register: (registry?: IRegistry) => void
}

export const BehaveGraphState = defineState({
  name: 'BehaveGraphState',
  initial: {
    domains: {} as Record<GraphDomainID, BehaveGraphDomainType>,
    registry: {} as IRegistry
  }
})

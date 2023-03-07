import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineState } from '@etherealengine/hyperflux'

export const NetworkState = defineState({
  name: 'NetworkState',
  initial: {
    hostIds: {
      media: null as UserId | null,
      world: null as UserId | null
    }
  }
})

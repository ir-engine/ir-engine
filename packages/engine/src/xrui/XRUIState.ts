import { defineState } from '@xrengine/hyperflux'

export const XRUIState = defineState({
  name: 'XRUIState',
  initial: () => ({
    pointerActive: false
  })
})

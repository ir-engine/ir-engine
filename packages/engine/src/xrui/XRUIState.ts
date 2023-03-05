import { defineState } from '@etherealengine/hyperflux'

export const XRUIState = defineState({
  name: 'XRUIState',
  initial: () => ({
    pointerActive: false
  })
})

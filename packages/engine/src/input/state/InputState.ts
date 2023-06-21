import { defineState } from '@etherealengine/hyperflux'

export const InputState = defineState({
  name: 'EE.InputState',

  initial: {
    inputSources: XRInputSourceArray
  }
})

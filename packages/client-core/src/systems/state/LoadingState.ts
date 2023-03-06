import { defineState } from '@etherealengine/hyperflux'

export const LoadingSystemState = defineState({
  name: 'LoadingSystemState',
  initial: () => ({
    loadingScreenOpacity: 1
  })
})

import { defineState } from '@xrengine/hyperflux'

export const LoadingSystemState = defineState({
  name: 'LoadingSystemState',
  initial: () => ({
    loadingScreenOpacity: 1
  })
})

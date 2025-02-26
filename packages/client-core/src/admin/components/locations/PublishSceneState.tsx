import { defineState } from '@ir-engine/hyperflux'

export const PublishSceneState = defineState({
  name: 'PublishSceneState',
  initial: () => ({
    isInCompresssedPublishing: false
  })
})

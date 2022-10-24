import { defineState } from '@xrengine/hyperflux'

export const CameraSettings = defineState({
  name: 'xre.engine.CameraSettings',
  initial: () => ({
    cameraRotationSpeed: 200
  })
})

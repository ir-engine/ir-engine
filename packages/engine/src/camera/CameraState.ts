import matches from 'ts-matches'

import { defineAction, defineState } from '@etherealengine/hyperflux'

export const CameraSettings = defineState({
  name: 'xre.engine.CameraSettings',
  initial: () => ({
    cameraRotationSpeed: 100
  })
})

export class CameraActions {
  static fadeToBlack = defineAction({
    type: 'xre.engine.CameraActions.FadeToBlack' as const,
    in: matches.boolean
  })
}

import { defineAction } from '@etherealengine/hyperflux'
import matches from 'ts-matches'

export class MotionCaptureAction {
  static trackingScopeChanged = defineAction({
    type: 'ee.mocap.trackLowerBody' as const,
    trackingLowerBody: matches.boolean,
    $cache: { removePrevious: true }
  })
}

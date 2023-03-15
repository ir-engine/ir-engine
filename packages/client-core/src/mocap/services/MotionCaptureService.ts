import { NormalizedLandmark } from '@mediapipe/pose'

import { matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const MotionCaptureState = defineState({
  name: 'MotionCaptureState',
  initial: () => ({
    data: [] as NormalizedLandmark[]
  })
})

export function motionCaptureDataReceptor(action: typeof MotionCaptureAction.getData.matches._TYPE) {
  const s = getMutableState(MotionCaptureState)
  s.merge({
    data: action.data
  })
}

//Service
export const MotionCaptureService = {
  getPose: async () => {
    try {
      dispatchAction(MotionCaptureAction.getData({}))
      // @ts-ignore
      const d = await API.instance.client.service('MotionCapture').getData()
      console.log(d)
      return d
    } catch (err) {
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

//Action
export class MotionCaptureAction {
  static setData = defineAction({
    type: 'xre.client.MotionCapture.MOTION_CAPTURE_SET_DATA' as const,
    data: matches.any
  })
  static getData = defineAction({
    type: 'xre.client.MotionCapture.MOTION_CAPTURE_GET_DATA' as const,
    data: matches.any
  })
}

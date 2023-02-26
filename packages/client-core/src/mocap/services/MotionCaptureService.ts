import { NormalizedLandmark } from '@mediapipe/pose'

import { matches } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from '../../common/services/NotificationService'

//State
export const MotionCaptureState = defineState({
  name: 'MotionCaptureState',
  initial: () => ({
    data: [] as NormalizedLandmark[]
  })
})

export const MotionCaptureServiceReceptor = (action) => {
  const s = getState(MotionCaptureState)
  matches(action).when(MotionCaptureAction.setData.matches, (action) => {
    return s.merge({
      data: action.data
    })
  })
}

export const accessMotionCaptureState = () => getState(MotionCaptureState)

export const useMotionCaptureState = () => useState(accessMotionCaptureState())

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

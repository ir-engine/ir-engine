import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { MotionCaptureAction } from '../functions/MotionCaptureAction'
import { MotionCaptureActionReceptor } from '../functions/MotionCaptureReceptor'

export default async function MotionCaptureSystem() {
  const motionCaptureDataQueue = createActionQueue(MotionCaptureAction.setData.matches)

  const execute = () => {
    for (const action of motionCaptureDataQueue()) MotionCaptureActionReceptor.receiveMotionCaptureData(action)
  }

  const cleanup = async () => {
    removeActionQueue(motionCaptureDataQueue)
  }

  return { execute, cleanup }
}

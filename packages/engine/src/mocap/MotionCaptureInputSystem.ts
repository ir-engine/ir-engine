import { dispatchAction } from '@etherealengine/hyperflux'
import { Engine } from '../ecs/classes/Engine'
import { defineQuery } from '../ecs/functions/ComponentFunctions'
import { InputSystemGroup } from '../ecs/functions/EngineFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { MotionCaptureInputActions } from './MotionCaptureInputActions'
import { MotionCaptureRigComponent } from './MotionCaptureRigComponent'
import { evaluatePose } from './poseToInput'

const motionCaptureQuery = defineQuery([MotionCaptureRigComponent])
export const execute = () => {
  for (const entity of motionCaptureQuery()) {
    const poseChange = evaluatePose(entity)
    if (poseChange != 'none') {
      // local input events
      if (entity == Engine.instance.localClientEntity)
        dispatchAction(MotionCaptureInputActions.assumedPose({ pose: poseChange }))
    }
  }
}

export const MotionCaptureInputSystem = defineSystem({
  uuid: 'ee.engine.MotionCaptureInputSystem',
  insert: { with: InputSystemGroup },
  execute
})

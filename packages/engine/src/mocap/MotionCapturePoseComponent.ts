import matches from 'ts-matches'
import { defineComponent } from '../ecs/functions/ComponentFunctions'
import { MotionCaptureStates } from './poseToInput'

export const MotionCapturePoseComponent = defineComponent({
  name: 'MotionCapturePoseComponent',
  onInit: () => 'none' as MotionCaptureStates,
  onSet: (entity, component, pose: MotionCaptureStates) => {
    if (matches.string.test(pose)) component.set(pose)
  }
})

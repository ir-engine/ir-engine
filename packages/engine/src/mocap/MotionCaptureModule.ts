import { InputSystemGroup, insertSystems } from '../ecs/functions/SystemFunctions'
import { MotionCaptureSystem } from './MotionCaptureSystem'

export const MotionCaptureSystems = () => {
  insertSystems([MotionCaptureSystem], 'before', InputSystemGroup)
}

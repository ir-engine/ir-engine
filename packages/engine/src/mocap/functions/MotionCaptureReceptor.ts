import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../../ecs/functions/EntityFunctions'
import { MotionCaptureComponent, setMotionCaptureData } from '../../mocap/components/MotionCaptureComponent'
import { MotionCaptureAction } from './MotionCaptureAction'

const receiveMotionCaptureData = (action: typeof MotionCaptureAction.setData.matches._TYPE) => {
  debugger
  const existingData = MotionCaptureAction.setData.matches.test(action)
  if (existingData) return

  const { data } = action
  const entity = createEntity()

  setMotionCaptureData(entity, data)
}

export const MotionCaptureActionReceptor = {
  receiveMotionCaptureData
}

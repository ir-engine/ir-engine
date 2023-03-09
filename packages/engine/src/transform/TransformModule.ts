import { SystemUpdateType } from '../ecs/functions/SystemUpdateType'
import PhysicsSystem from '../physics/systems/PhysicsSystem'
import TransformSystem from './systems/TransformSystem'

export function TransformModule() {
  return [
    {
      uuid: 'xre.engine.TransformSystem',
      type: SystemUpdateType.UPDATE_LATE,
      systemLoader: () => Promise.resolve({ default: TransformSystem })
    },
    {
      uuid: 'xre.engine.PhysicsSystem',
      type: SystemUpdateType.FIXED_LATE,
      systemLoader: () => Promise.resolve({ default: PhysicsSystem })
    }
  ]
}

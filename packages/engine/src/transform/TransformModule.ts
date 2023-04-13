import { insertSystems, PostAvatarUpdateSystemGroup, SimulationSystemGroup } from '../ecs/functions/SystemFunctions'
import { PhysicsSystem } from '../physics/systems/PhysicsSystem'
import { TransformSystem } from './systems/TransformSystem'

export const TransformSystems = () => {
  insertSystems([TransformSystem], 'before', PostAvatarUpdateSystemGroup)
  insertSystems([PhysicsSystem], 'after', SimulationSystemGroup)
}

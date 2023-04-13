import { InputSystemGroup, insertSystems, SimulationSystemGroup } from '../ecs/functions/SystemFunctions'
import { ReferenceSpaceTransformSystem } from '../transform/systems/ReferenceSpaceTransformSystem'
import { TransformSystem } from '../transform/systems/TransformSystem'
import { XRAnchorSystem } from '../xr/XRAnchorSystem'
import { AnimationSystem } from './AnimationSystem'
import { AvatarAnimationSystem } from './AvatarAnimationSystem'
import { AvatarAutopilotSystem } from './AvatarAutopilotSystem'
import { AvatarControllerSystem } from './AvatarControllerSystem'
import { AvatarInputSystem } from './AvatarInputSystem'
import { AvatarLoadingSystem } from './AvatarLoadingSystem'
import { AvatarMovementSystem } from './AvatarMovementSystem'
import { AvatarTeleportSystem } from './AvatarTeleportSystem'
import { FlyControlSystem } from './FlyControlSystem'

export const AvatarClientSystems = () => {
  insertSystems([AvatarInputSystem, AvatarControllerSystem, AvatarTeleportSystem], 'before', InputSystemGroup)
  insertSystems([AnimationSystem], 'with', InputSystemGroup)
  insertSystems([AvatarMovementSystem, AvatarAutopilotSystem], 'before', SimulationSystemGroup)
  insertSystems([ReferenceSpaceTransformSystem, AvatarAnimationSystem], 'before', TransformSystem)
  insertSystems([XRAnchorSystem], 'after', ReferenceSpaceTransformSystem)
  insertSystems([FlyControlSystem, AvatarLoadingSystem], 'before', SimulationSystemGroup)
}

import { defineSystem } from '../ecs/functions/SystemFunctions'
import { AvatarAutopilotSystem } from './AvatarAutopilotSystem'
import { AvatarControllerSystem } from './AvatarControllerSystem'
import { AvatarInputSystem } from './AvatarInputSystem'
import { AvatarLoadingSystem } from './AvatarLoadingSystem'
import { AvatarMovementSystem } from './AvatarMovementSystem'
import { AvatarTeleportSystem } from './AvatarTeleportSystem'
import { FlyControlSystem } from './FlyControlSystem'

export const AvatarInputGroup = defineSystem({
  uuid: 'ee.engine.avatar-input-group',
  subSystems: [AvatarInputSystem, AvatarControllerSystem, AvatarTeleportSystem, FlyControlSystem, AvatarLoadingSystem]
})

export const AvatarSimulationGroup = defineSystem({
  uuid: 'ee.engine.avatar-simulation-group',
  subSystems: [AvatarMovementSystem, AvatarAutopilotSystem]
})

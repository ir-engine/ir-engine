import {
  createWorld,
  addEntity,
  removeEntity,
  IWorld,
  defineComponent,
  addComponent,
  removeComponent,
  hasComponent,
  defineQuery,
  Changed,
  Not,
  enterQuery,
  exitQuery,
  defineSystem,
  System,
  defineSerializer,
  defineDeserializer,
  pipe,
  Types
} from 'bitecs'

import { EngineEvents } from '../ecs/classes/EngineEvents'
import { getEntityByID, getMutableComponent } from '../ecs/functions/EntityFunctions'
import { AnimationManager } from './AnimationManager'
import { AnimationSystem } from './AnimationSystem'
import { AvatarComponent } from './components/AvatarComponent'
import { setAvatar } from './functions/avatarFunctions'

type Module = {
  system: System
  cleanup: () => void
}

export const AnimationModule = async (): Promise<System> => {
  await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])

  return defineSystem((world: IWorld) => {
    return world
  })
}

import {
  createWorld,
  addEntity,
  removeEntity,
  IWorld,
  ComponentType,
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
  ISchema,
  defineSerializer,
  defineDeserializer,
  pipe,
  Types
} from 'bitecs'

import { AnimationManager } from './AnimationManager'

// const AnimationComponent = defineComponent(...)
// const animationQuery = defineQuery([AnimationComponent])

// export const AnimationModule = async (): Promise<System> => {

//   await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])

//   return defineSystem((world: IWorld, delta: number) => {

//     for (const entity of animationQuery(world)) {
//       AnimationComponent.mixer[entity].update(delta)
//     }

//     return world
//   })
// }

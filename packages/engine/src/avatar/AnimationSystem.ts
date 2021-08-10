import { Vector3 } from 'three'
import { getComponent } from '../ecs/functions/EntityFunctions'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationGraph } from './animations/AvatarAnimationGraph'
import { AvatarStates } from './animations/Util'
import { AnimationRenderer } from './animations/AnimationRenderer'
import { loadAvatar } from './functions/avatarFunctions'
import { AnimationManager } from './AnimationManager'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'
import { ECSWorld } from '../ecs/classes/World'
import { defineQuery, defineSystem, enterQuery, System } from '../ecs/bitecs'

export const AnimationSystem = async (): Promise<System> => {
  const animationQuery = defineQuery([AnimationComponent])
  const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent])
  const avatarAnimationAddQuery = enterQuery(avatarAnimationQuery)

  await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of animationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const modifiedDelta = delta * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)
    }

    for (const entity of avatarAnimationAddQuery(world)) {
      loadAvatar(entity)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      avatarAnimationComponent.animationGraph = new AvatarAnimationGraph()
      avatarAnimationComponent.currentState = avatarAnimationComponent.animationGraph.states[AvatarStates.IDLE]
      avatarAnimationComponent.prevVelocity = new Vector3()
      if (avatarAnimationComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }
    }

    for (const entity of avatarAnimationQuery(world)) {
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      avatarAnimationComponent.animationGraph.render(entity, deltaTime)
      AnimationRenderer.render(entity, delta)
    }

    return world
  })
}

import { Vector3 } from 'three'
import { System } from '../ecs/classes/System'
import { getMutableComponent } from '../ecs/functions/EntityFunctions'
import { AnimationComponent } from './components/AnimationComponent'
import { AvatarAnimationGraph } from './animations/AvatarAnimationGraph'
import { AvatarStates } from './animations/Util'
import { AnimationRenderer } from './animations/AnimationRenderer'
import { loadAvatar } from './functions/avatarFunctions'
import { AnimationManager } from './AnimationManager'
import { AvatarAnimationComponent } from './components/AvatarAnimationComponent'

export class AnimationSystem extends System {
  async initialize(): Promise<void> {
    super.initialize()
    await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])
  }

  /**
   * Executes the system. Called each frame by default from the Engine.
   * @param delta Time since last frame.
   */
  execute(delta: number): void {
    for (const entity of this.queryResults.animation.all) {
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      const modifiedDelta = delta * animationComponent.animationSpeed
      animationComponent.mixer.update(modifiedDelta)
    }

    for (const entity of this.queryResults.avatarAnimation.added) {
      loadAvatar(entity)
      const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)
      avatarAnimationComponent.animationGraph = new AvatarAnimationGraph()
      avatarAnimationComponent.currentState = avatarAnimationComponent.animationGraph.states[AvatarStates.IDLE]
      avatarAnimationComponent.prevVelocity = new Vector3()
      if (avatarAnimationComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }
    }

    for (const entity of this.queryResults.avatarAnimation.all) {
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      avatarAnimationComponent.animationGraph.render(entity, deltaTime)
      AnimationRenderer.render(entity, delta)
    }
  }
}

AnimationSystem.queries = {
  animation: {
    components: [AnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  avatarAnimation: {
    components: [AnimationComponent, AvatarAnimationComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

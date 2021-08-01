import { Vector3 } from 'three'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { System } from '../ecs/classes/System'
import { getMutableComponent, getEntityByID } from '../ecs/functions/EntityFunctions'
import { AnimationComponent } from './components/AnimationComponent'
import { CharacterComponent } from './components/CharacterComponent'
import { CharacterAnimationGraph } from './animations/CharacterAnimationGraph'
import { CharacterStates } from './animations/Util'
import { AnimationRenderer } from './animations/AnimationRenderer'
import { loadActorAvatar } from './functions/avatarFunctions'
import { AnimationManager } from './AnimationManager'
import { VelocityComponent } from '../physics/components/VelocityComponent'
import { CharacterAnimationStateComponent } from './components/CharacterAnimationStateComponent'

export class AnimationSystem extends System {
  // Entity
  static EVENTS = {
    LOAD_AVATAR: 'ANIMATION_SYSTEM_LOAD_AVATAR'
  }

  constructor() {
    super()

    EngineEvents.instance.addEventListener(AnimationSystem.EVENTS.LOAD_AVATAR, ({ entityID, avatarId, avatarURL }) => {
      const entity = getEntityByID(entityID)
      const actor = getMutableComponent(entity, CharacterComponent)
      if (actor) {
        actor.avatarId = avatarId
        actor.avatarURL = avatarURL
      }
      loadActorAvatar(entity)
    })
  }

  async initialize(): Promise<void> {
    super.initialize()
    await Promise.all([AnimationManager.instance.getDefaultModel(), AnimationManager.instance.getAnimations()])
  }

  /** Removes resize listener. */
  dispose(): void {
    super.dispose()
    EngineEvents.instance.removeAllListenersForEvent(AnimationSystem.EVENTS.LOAD_AVATAR)
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

    for (const entity of this.queryResults.animationCharacter.added) {
      loadActorAvatar(entity)
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      const characterAnimationStateComponent = getMutableComponent(entity, CharacterAnimationStateComponent)
      characterAnimationStateComponent.animationGraph = new CharacterAnimationGraph()
      characterAnimationStateComponent.currentState =
        characterAnimationStateComponent.animationGraph.states[CharacterStates.IDLE]
      characterAnimationStateComponent.prevVelocity = new Vector3()
      if (characterAnimationStateComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }
    }

    for (const entity of this.queryResults.animationCharacter.all) {
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      const characterAnimationStateComponent = getMutableComponent(entity, CharacterAnimationStateComponent)
      const deltaTime = delta * animationComponent.animationSpeed
      characterAnimationStateComponent.animationGraph.render(entity, deltaTime)
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
  animationCharacter: {
    components: [AnimationComponent, CharacterAnimationStateComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

import { LoopRepeat, AnimationClip, AnimationMixer } from 'three'
import { AnimationManager } from '../../avatar/AnimationManager'
import { AnimationState } from '../../avatar/animations/AnimationState'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { receiveActionOnce } from '../../networking/functions/matchActionOnce'
import { Object3DComponent } from '../components/Object3DComponent'
import { SceneDataComponent } from './SceneLoading'

export const loadModelAnimation = (entity: Entity, component: SceneDataComponent) => {
  if (isClient) {
    receiveActionOnce(EngineEvents.EVENTS.SCENE_LOADED, () => {
      // We only have to update the mixer time for this animations on each frame
      const object3d = getComponent(entity, Object3DComponent)
      if (!object3d) {
        console.warn(
          'Tried to load animation without an Object3D Component attached! Are you sure the model has loaded?'
        )
      }
      const animations = component.data.hasAvatarAnimations
        ? AnimationManager.instance._animations
        : object3d.value.animations
      const mixer = new AnimationMixer(object3d.value)

      const animationComponent = addComponent(entity, AnimationComponent, {
        animations,
        mixer,
        animationSpeed: 1
      })
      const currentState = new AnimationState()
      if (component.data.activeClipIndex >= 0) {
        const clip = animationComponent.animations[component.data.activeClipIndex]
        const action = animationComponent.mixer.clipAction(
          AnimationClip.findByName(animationComponent.animations, clip.name)
        )
        action.setEffectiveWeight(1)
        currentState.animations = [
          {
            name: clip.name,
            weight: 1,
            loopType: LoopRepeat,
            action
          }
        ] as any
        currentState.animations[0].action.play()
      }
    })
  }
}

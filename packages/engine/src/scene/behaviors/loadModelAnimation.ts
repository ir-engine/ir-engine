import { LoopRepeat, AnimationClip, AnimationMixer } from 'three'
import { AnimationManager } from '../../avatar/AnimationManager'
import { AnimationState } from '../../avatar/animations/AnimationState'
import { AnimationComponent } from '../../avatar/components/AnimationComponent'
import { isClient } from '../../common/functions/isClient'
import { EngineEvents } from '../../ecs/classes/EngineEvents'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { SceneDataComponent } from '../interfaces/SceneDataComponent'

export const loadModelAnimation = (entity: Entity, component: SceneDataComponent) => {
  if (isClient) {
    EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
      // We only have to update the mixer time for this animations on each frame
      const object3d = getMutableComponent(entity, Object3DComponent)
      if (!object3d) {
        console.warn(
          'Tried to load animation without an Object3D Component attached! Are you sure the model has loaded?'
        )
      }
      addComponent(entity, AnimationComponent)
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      if (component.data.hasAvatarAnimations) {
        animationComponent.animations = AnimationManager.instance._animations
      } else {
        animationComponent.animations = object3d.value.animations
      }
      animationComponent.mixer = new AnimationMixer(object3d.value)
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
        ]
        currentState.animations[0].action.play()
      }
    })
  }
}

import { AnimationMixer, Group } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { CharacterComponent } from '../components/CharacterComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { AnimationRenderer } from '../animations/AnimationRenderer'
import { CharacterAnimationStateComponent } from '../components/CharacterAnimationStateComponent'
import { Entity } from '../../ecs/classes/Entity'

export const loadDefaultActorAvatar = (entity: Entity) => {
  const actor = getMutableComponent(entity, CharacterComponent)
  const model = SkeletonUtils.clone(AnimationManager.instance._defaultModel)

  model.traverse((object) => {
    if (object.isMesh || object.isSkinnedMesh) {
      object.material = object.material.clone()
    }
  })
  model.children.forEach((child) => actor.modelContainer.add(child))

  const animationComponent = getMutableComponent(entity, AnimationComponent)
  animationComponent.mixer = new AnimationMixer(actor.modelContainer)
}

export const loadActorAvatar = (entity: Entity) => {
  if (!isClient) return
  const avatarURL = getComponent(entity, CharacterComponent)?.avatarURL
  if (avatarURL) {
    loadActorAvatarFromURL(entity, avatarURL)
  } else {
    loadDefaultActorAvatar(entity)
  }
}

export const loadActorAvatarFromURL = (entity: Entity, avatarURL: string) => {
  AssetLoader.load(
    {
      url: avatarURL,
      castShadow: true,
      receiveShadow: true
    },
    (asset: Group) => {
      const model = SkeletonUtils.clone(asset)
      const actor = getMutableComponent(entity, CharacterComponent)
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      const characterAnimationStateComponent = getMutableComponent(entity, CharacterAnimationStateComponent)

      animationComponent.mixer.stopAllAction()
      actor.modelContainer.children.forEach((child) => child.removeFromParent())

      model.traverse((object) => {
        if (typeof object.material !== 'undefined') {
          object.material = object.material.clone()
        }
      })

      animationComponent.mixer = new AnimationMixer(actor.modelContainer)
      model.children.forEach((child) => actor.modelContainer.add(child))

      if (characterAnimationStateComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }

      // advance animation for a frame to eliminate potential t-pose
      animationComponent.mixer.update(1 / 60)
    }
  )
}

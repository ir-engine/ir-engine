import { AnimationMixer, Group } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { getComponent, getEntityByID, getMutableComponent } from '../../ecs/functions/EntityFunctions'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { AnimationRenderer } from '../animations/AnimationRenderer'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { Entity } from '../../ecs/classes/Entity'

export const setAvatar = ({ entityID, avatarId, avatarURL }) => {
  const entity = getEntityByID(entityID)
  const avatar = getMutableComponent(entity, AvatarComponent)
  if (avatar) {
    avatar.avatarId = avatarId
    avatar.avatarURL = avatarURL
  }
  loadAvatar(entity)
}

export const loadAvatar = (entity: Entity) => {
  if (!isClient) return
  const avatarURL = getComponent(entity, AvatarComponent)?.avatarURL
  if (avatarURL) {
    loadAvatarFromURL(entity, avatarURL)
  } else {
    loadDefaultAvatar(entity)
  }
}

const loadDefaultAvatar = (entity: Entity) => {
  const avatar = getMutableComponent(entity, AvatarComponent)
  const model = SkeletonUtils.clone(AnimationManager.instance._defaultModel)

  model.traverse((object) => {
    if (object.isMesh || object.isSkinnedMesh) {
      object.material = object.material.clone()
    }
  })
  model.children.forEach((child) => avatar.modelContainer.add(child))

  const animationComponent = getMutableComponent(entity, AnimationComponent)
  animationComponent.mixer = new AnimationMixer(avatar.modelContainer)
}

const loadAvatarFromURL = (entity: Entity, avatarURL: string) => {
  AssetLoader.load(
    {
      url: avatarURL,
      castShadow: true,
      receiveShadow: true
    },
    (asset: Group) => {
      const model = SkeletonUtils.clone(asset)
      const avatar = getMutableComponent(entity, AvatarComponent)
      const animationComponent = getMutableComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getMutableComponent(entity, AvatarAnimationComponent)

      animationComponent.mixer.stopAllAction()
      avatar.modelContainer.children.forEach((child) => child.removeFromParent())

      model.traverse((object) => {
        if (typeof object.material !== 'undefined') {
          object.material = object.material.clone()
        }
      })

      animationComponent.mixer = new AnimationMixer(avatar.modelContainer)
      model.children.forEach((child) => avatar.modelContainer.add(child))

      if (avatarAnimationComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }

      // advance animation for a frame to eliminate potential t-pose
      animationComponent.mixer.update(1 / 60)
    }
  )
}

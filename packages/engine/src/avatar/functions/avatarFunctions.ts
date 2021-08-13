import { AnimationMixer, Group } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { AnimationRenderer } from '../animations/AnimationRenderer'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { Entity } from '../../ecs/classes/Entity'
import {
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  AdditiveBlending,
  sRGBEncoding,
  ShaderMaterial,
  DoubleSide
} from 'three'
import { addComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { DissolveEffect } from '../DissolveEffect'

export const setAvatar = (entity, avatarId, avatarURL) => {
  const avatar = getComponent(entity, AvatarComponent)
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
  const avatar = getComponent(entity, AvatarComponent)
  const model = SkeletonUtils.clone(AnimationManager.instance._defaultModel)

  model.traverse((object) => {
    if (object.isMesh || object.isSkinnedMesh) {
      object.material = object.material.clone()
    }
  })
  model.children.forEach((child) => avatar.modelContainer.add(child))

  const animationComponent = getComponent(entity, AnimationComponent)
  animationComponent.mixer = new AnimationMixer(avatar.modelContainer)
}

const loadAvatarFromURL = (entity: Entity, avatarURL: string) => {
  AssetLoader.load(
    {
      url: avatarURL,
      castShadow: true,
      receiveShadow: true
    },
    async (asset: Group) => {
      asset.traverse((o) => {
        // TODO: Remove me when we add retargeting
        if (o.name.includes('mixamorig')) {
          o.name = o.name.replace('mixamorig', '')
        }
      })

      const model = SkeletonUtils.clone(asset)
      const avatar = getComponent(entity, AvatarComponent)
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

      animationComponent.mixer.stopAllAction()
      avatar.modelContainer.children.forEach((child) => child.removeFromParent())

      let materialList: Array<MaterialMap> = []

      model.traverse((object) => {
        if (typeof object.material !== 'undefined') {
          // object.material = object.material.clone()
          materialList.push({
            id: object.uuid,
            material: object.material.clone()
          })
          object.material = DissolveEffect.getDissolveTexture(object)
        }
      })

      animationComponent.mixer = new AnimationMixer(avatar.modelContainer)
      model.children.forEach((child) => avatar.modelContainer.add(child))

      if (avatarAnimationComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }

      // advance animation for a frame to eliminate potential t-pose
      animationComponent.mixer.update(1 / 60)

      await loadGrowingEffectObject(entity, materialList)
    }
  )
}

const loadGrowingEffectObject = async (entity: Entity, originalMatList: Array<MaterialMap>) => {
  const textureLight = await AssetLoader.loadAsync({ url: '/itemLight.png' })
  const texturePlate = await AssetLoader.loadAsync({ url: '/itemPlate.png' })

  const lightMesh = new Mesh(
    new PlaneGeometry(0.04, 3.2),
    new MeshBasicMaterial({
      transparent: true,
      map: textureLight,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide
    })
  )

  const plateMesh = new Mesh(
    new PlaneGeometry(1.6, 1.6),
    new MeshBasicMaterial({
      transparent: false,
      map: texturePlate,
      blending: AdditiveBlending,
      depthWrite: false
    })
  )

  lightMesh.geometry.computeBoundingSphere()
  plateMesh.geometry.computeBoundingSphere()
  lightMesh.name = 'growing_obj'
  plateMesh.name = 'growing_obj'

  textureLight.encoding = sRGBEncoding
  textureLight.needsUpdate = true
  texturePlate.encoding = sRGBEncoding
  texturePlate.needsUpdate = true

  addComponent(entity, AvatarPendingComponent, {
    light: lightMesh,
    plate: plateMesh
  })
  addComponent(entity, AvatarEffectComponent, {
    opacityMultiplier: 0,
    originMaterials: originalMatList
  })
}

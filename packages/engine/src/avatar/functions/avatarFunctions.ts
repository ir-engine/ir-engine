import { AnimationMixer, Bone, Group, Skeleton, SkeletonHelper, SkinnedMesh } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
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
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { DissolveEffect } from '../DissolveEffect'
import { bonesData2 } from '../DefaultSkeletonBones'
import { IKRigComponent, IKRigTargetComponent } from '../../ikrig/components/IKRigComponent'
import { IKObj } from '../../ikrig/components/IKObj'
import { addRig, addTargetRig } from '../../ikrig/functions/RigFunctions'
import { Engine } from '../../ecs/classes/Engine'
import { defaultIKPoseComponentValues, IKPoseComponent } from '../../ikrig/components/IKPoseComponent'

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
    (gltf: any) => {
      const avatar = getComponent(entity, AvatarComponent)
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

      const model = SkeletonUtils.clone(gltf.scene)

      model.traverse((o) => {
        // TODO: Remove me when we add retargeting
        if (o.name.includes('mixamorig')) {
          o.name = o.name.replace('mixamorig', '')
        }
      })

      // animation will be applied to this skeleton instead of avatar
      const sourceSkeletonRoot = SkeletonUtils.clone(getDefaultSkeleton().parent)
      const sourceSkinnedMesh = sourceSkeletonRoot.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh
      {
        // setup ikrig ==========================================
        // TODO: find the way to get Armature Type
        // TODO: find the way to separate them, we will have two rigs on same entity
        addComponent(entity, IKObj, { ref: sourceSkinnedMesh })
        addRig(entity, sourceSkeletonRoot)
      }

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

      animationComponent.mixer = new AnimationMixer(sourceSkeletonRoot)
      model.children.forEach((child) => avatar.modelContainer.add(child))

      if (avatarAnimationComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }

      // TODO: find skinned mesh in avatar.modelContainer
      const avatarSkinnedMesh = avatar.modelContainer.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh
      console.log('avatarSkinnedMesh', avatarSkinnedMesh)
      addComponent(entity, IKObj, { ref: avatarSkinnedMesh })
      const rig = addTargetRig(entity, avatar.modelContainer)
      console.log('avatar rig', rig)
      const ikpose = addComponent(entity, IKPoseComponent, defaultIKPoseComponentValues())
      console.log('avatar ikpose', ikpose)
      console.log('ac', animationComponent)

      const sh0 = new SkeletonHelper(avatar.modelContainer)
      Engine.scene.add(sh0)

      //avatar.modelContainer.add(sourceSkeletonRoot)
      const sh = new SkeletonHelper(sourceSkeletonRoot)
      Engine.scene.add(sh)
      Engine.scene.add(sourceSkeletonRoot)

      // advance animation for a frame to eliminate potential t-pose
      animationComponent.mixer.update(1 / 60)

      console.log(
        'entity has all 3',
        hasComponent(entity, IKRigComponent),
        hasComponent(entity, IKRigTargetComponent),
        hasComponent(entity, IKPoseComponent)
      )

      loadGrowingEffectObject(entity, materialList)
    }
  )
}

const loadGrowingEffectObject = async (entity: Entity, originalMatList: Array<MaterialMap>) => {
  const textureLight = AssetLoader.getFromCache('/itemLight.png')
  const texturePlate = AssetLoader.getFromCache('/itemPlate.png')

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
  lightMesh.name = 'light_obj'
  plateMesh.name = 'plate_obj'

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

export function getDefaultSkeleton(): SkinnedMesh {
  const bones = []
  bonesData2.forEach((data) => {
    const bone = new Bone()
    bone.name = data.name
    bone.position.fromArray(data.position)
    bone.quaternion.fromArray(data.quaternion)
    bone.scale.fromArray(data.scale)
    bones.push(bone)
  })

  bonesData2.forEach((data, index) => {
    if (data.parentIndex !== null) {
      bones[data.parentIndex].add(bones[index])
    }
  })

  const group = new Group()
  const skinnedMesh = new SkinnedMesh()
  const skeleton = new Skeleton(bones)
  skinnedMesh.bind(skeleton)
  group.add(skinnedMesh)
  group.add(bones[0]) // we assume that root bone is the first one

  return skinnedMesh
}

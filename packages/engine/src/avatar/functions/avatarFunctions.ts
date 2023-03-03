import { pipe } from 'bitecs'
import { AnimationClip, AnimationMixer, Bone, Box3, Group, Object3D, Skeleton, SkinnedMesh, Vector3 } from 'three'

import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetType } from '../../assets/enum/AssetType'
import { AnimationManager } from '../../avatar/AnimationManager'
import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { isClient } from '../../common/functions/isClient'
import { iOS } from '../../common/functions/isMobile'
import { EngineActions, EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import UpdateableObject3D from '../../scene/classes/UpdateableObject3D'
import { setCallback } from '../../scene/components/CallbackComponent'
import { addObjectToGroup, GroupComponent, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { UpdatableCallback, UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { computeTransformMatrix, updateGroupChildren } from '../../transform/systems/TransformSystem'
import { XRState } from '../../xr/XRState'
import { createAvatarAnimationGraph } from '../animation/AvatarAnimationGraph'
import { applySkeletonPose, isSkeletonInTPose, makeTPose } from '../animation/avatarPose'
import { retargetSkeleton, syncModelSkeletons } from '../animation/retargetSkeleton'
import avatarBoneMatching, { BoneNames, createSkeletonFromBone, findSkinnedMeshes } from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { defaultBonesData } from '../DefaultSkeletonBones'
import { DissolveEffect } from '../DissolveEffect'
import { SkeletonUtils } from '../SkeletonUtils'
import { resizeAvatar } from './resizeAvatar'

const tempVec3ForHeight = new Vector3()
const tempVec3ForCenter = new Vector3()

export const loadAvatarModelAsset = async (avatarURL: string) => {
  const model = await AssetLoader.loadAsync(avatarURL)
  const scene = model.scene || model // FBX files does not have 'scene' property
  if (!scene) return
  const parent = new Group()
  parent.name = 'model-parent'
  const root = new Group()
  root.name = 'model-root'
  root.add(scene)
  parent.add(root)
  parent.userData = scene.userData

  scene.traverse((obj) => {
    //TODO: To avoid the changes of the source material
    if (obj.material && obj.material.clone) {
      obj.material = obj.material.clone()
      //TODO: to fix alphablend issue of some models (mostly fbx converted models)
      if (obj.material.opacity != 0) {
        obj.material.depthWrite = true
      } else {
        obj.material.depthWrite = false
      }
      obj.material.depthTest = true
    }
    // Enable shadow for avatars
    obj.castShadow = true
  })
  return SkeletonUtils.clone(parent) as Object3D
}

export const loadAvatarForUser = async (
  entity: Entity,
  avatarURL: string,
  loadingEffect = getState(EngineState).avatarLoadingEffect.value && !getState(XRState).sessionActive.value && !iOS
) => {
  if (hasComponent(entity, AvatarPendingComponent) && getComponent(entity, AvatarPendingComponent).url === avatarURL)
    return

  if (loadingEffect) {
    if (hasComponent(entity, AvatarControllerComponent)) {
      getComponent(entity, AvatarControllerComponent).movementEnabled = false
    }
  }

  setComponent(entity, AvatarPendingComponent, { url: avatarURL })
  const parent = await loadAvatarModelAsset(avatarURL)

  /** hack a cancellable promise - check if the url we start with is the one we end up with */
  if (!hasComponent(entity, AvatarPendingComponent) || getComponent(entity, AvatarPendingComponent).url !== avatarURL)
    return

  removeComponent(entity, AvatarPendingComponent)

  if (!parent) return
  setupAvatarForUser(entity, parent)

  if (isClient && loadingEffect) {
    const avatar = getComponent(entity, AvatarComponent)
    const avatarMaterials = setupAvatarMaterials(entity, avatar.model)
    const effectEntity = createEntity()
    addComponent(effectEntity, AvatarEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1,
      originMaterials: avatarMaterials
    })
  }

  dispatchAction(EngineActions.avatarModelChanged({ entity }))
}

export const setupAvatarForUser = (entity: Entity, model: Object3D) => {
  const avatar = getComponent(entity, AvatarComponent)
  if (avatar.model) removeObjectFromGroup(entity, avatar.model)

  setupAvatarModel(entity)(model)
  addObjectToGroup(entity, model)

  computeTransformMatrix(entity)
  updateGroupChildren(entity)

  setupAvatarHeight(entity, model)

  setObjectLayers(model, ObjectLayers.Avatar)
  avatar.model = model
}

export const setupAvatarModel = (entity: Entity) =>
  pipe(boneMatchAvatarModel(entity), rigAvatarModel(entity), animateAvatarModel(entity))

export const boneMatchAvatarModel = (entity: Entity) => (model: Object3D) => {
  const assetType = model.userData.type

  const groupComponent = getOptionalComponent(entity, GroupComponent)

  if (assetType == AssetType.FBX) {
    // TODO: Should probably be applied to vertexes in the modeling tool
    model.children[0].scale.setScalar(0.01)
    if (groupComponent) for (const obj of groupComponent) obj.userData.scale = 0.01
  } else if (assetType == AssetType.VRM) {
    if (model && (model as UpdateableObject3D).update) {
      addComponent(entity, UpdatableComponent, true)
      setCallback(entity, UpdatableCallback, (delta: number) => {
        ;(model as UpdateableObject3D).update(delta)
      })
    }
  }

  return model
}

export const rigAvatarModel = (entity: Entity) => (model: Object3D) => {
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  removeComponent(entity, AvatarRigComponent)
  const rig = avatarBoneMatching(model)
  const rootBone = rig.Root || rig.Hips
  rootBone.updateWorldMatrix(true, true)

  const skinnedMeshes = findSkinnedMeshes(model)

  /**@todo replace check for loop aniamtion component with ensuring tpose is only handled once */
  // Try converting to T pose
  if (!hasComponent(entity, LoopAnimationComponent)) {
    makeTPose(rig)
    skinnedMeshes.forEach(applySkeletonPose)
  }

  const targetSkeleton = createSkeletonFromBone(rootBone)

  const sourceSkeleton = AnimationManager.instance._defaultSkinnedMesh.skeleton
  retargetSkeleton(targetSkeleton, sourceSkeleton)
  syncModelSkeletons(model, targetSkeleton)

  setComponent(entity, AvatarRigComponent, {
    rig,
    bindRig: avatarBoneMatching(SkeletonUtils.clone(rootBone)),
    skinnedMeshes
  })

  const sourceHips = sourceSkeleton.bones[0]
  avatarAnimationComponent.rootYRatio = rig.Hips.position.y / sourceHips.position.y

  return model
}

export const animateAvatarModel = (entity: Entity) => (model: Object3D) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  const controllerComponent = getOptionalComponent(entity, AvatarControllerComponent)

  animationComponent.mixer?.stopAllAction()
  // Mixer has some issues when binding with the target skeleton
  // We have to bind the mixer with original skeleton and copy resulting bone transforms after update
  const sourceSkeleton = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton
  animationComponent.mixer = new AnimationMixer(sourceSkeleton.bones[0])
  animationComponent.animations = AnimationManager.instance._animations

  if (avatarAnimationComponent)
    avatarAnimationComponent.animationGraph = createAvatarAnimationGraph(
      entity,
      animationComponent.mixer,
      avatarAnimationComponent.locomotion,
      controllerComponent ?? {}
    )

  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(1 / 60)
}

export const animateModel = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  animationComponent.mixer.clipAction(AnimationClip.findByName(animationComponent.animations, 'wave')).play()
}

export const setupAvatarMaterials = (entity, root) => {
  const materialList: Array<MaterialMap> = []
  setObjectLayers(root, ObjectLayers.Avatar)

  root.traverse((object) => {
    if (object.isBone) object.visible = false
    if (object.material && object.material.clone) {
      const material = object.material
      materialList.push({
        id: object.uuid,
        material: material
      })
      object.material = DissolveEffect.getDissolveTexture(object)
    }
  })

  return materialList
}

export const setupAvatarHeight = (entity: Entity, model: Object3D) => {
  const box = new Box3()
  box.expandByObject(model).getSize(tempVec3ForHeight)
  box.getCenter(tempVec3ForCenter)
  resizeAvatar(entity, tempVec3ForHeight.y, tempVec3ForCenter)
}

/**
 * Creates an empty skinned mesh with the default skeleton attached.
 * The skeleton created is compatible with default animation tracks
 * @returns SkinnedMesh
 */
export function makeDefaultSkinnedMesh() {
  return makeSkinnedMeshFromBoneData(defaultBonesData)
}

/**
 * Creates an empty skinned mesh using list of bones to build skeleton structure
 * @returns SkinnedMesh
 */
export function makeSkinnedMeshFromBoneData(bonesData) {
  const bones: Bone[] = []
  bonesData.forEach((data) => {
    const bone = new Bone()
    bone.name = data.name
    bone.position.fromArray(data.position)
    bone.quaternion.fromArray(data.quaternion)
    bone.scale.setScalar(1)
    bones.push(bone)
  })

  bonesData.forEach((data, index) => {
    if (data.parentIndex > -1) {
      bones[data.parentIndex].add(bones[index])
    }
  })

  // we assume that root bone is the first one
  const hipBone = bones[0]
  hipBone.updateWorldMatrix(false, true)

  const group = new Group()
  group.name = 'skinned-mesh-group'
  const skinnedMesh = new SkinnedMesh()
  const skeleton = new Skeleton(bones)
  skinnedMesh.bind(skeleton)
  group.add(skinnedMesh)
  group.add(hipBone)

  return group
}

export const getAvatarBoneWorldPosition = (entity: Entity, boneName: BoneNames, position: Vector3): boolean => {
  const avatarRigComponent = getOptionalComponent(entity, AvatarRigComponent)
  if (!avatarRigComponent) return false
  const bone = avatarRigComponent.rig[boneName]
  if (!bone) return false
  const el = bone.matrixWorld.elements
  position.set(el[12], el[13], el[14])
  return true
}

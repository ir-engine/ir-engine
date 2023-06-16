/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { pipe } from 'bitecs'
import { AnimationClip, AnimationMixer, Bone, Box3, Group, Mesh, Object3D, Skeleton, SkinnedMesh, Vector3 } from 'three'

import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetType } from '../../assets/enum/AssetType'
//import { AnimationManager } from '../../vehicle/AnimationManager'
//import { LoopAnimationComponent } from '../../vehicle/components/LoopAnimationComponent'
import { isClient } from '../../common/functions/getEnvironment'
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
import iterateObject3D from '../../scene/util/iterateObject3D'
import { computeTransformMatrix, updateGroupChildren } from '../../transform/systems/TransformSystem'
import { XRState } from '../../xr/XRState'
import { AnimationComponent } from '../components/AnimationComponent'
import { VehicleAnimationComponent, VehicleRigComponent } from '../components/VehicleAnimationComponent'
import { VehicleComponent } from '../components/VehicleComponent'
import { VehicleControllerComponent } from '../components/VehicleControllerComponent'
import { MaterialMap, VehicleEffectComponent } from '../components/VehicleEffectComponent'
import { VehiclePendingComponent } from '../components/VehiclePendingComponent'
import { SkeletonUtils } from '../SkeletonUtils'

const tempVec3ForHeight = new Vector3()
const tempVec3ForCenter = new Vector3()

export const loadVehicleModelAsset = async (vehicleURL: string) => {
  const model = await AssetLoader.loadAsync(vehicleURL)
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
    // Enable shadow for vehicles
    obj.castShadow = true
  })
  return SkeletonUtils.clone(parent) as Object3D
}

export const loadVehicleForUser = async (
  entity: Entity,
  vehicleURL: string,
  loadingEffect = getState(EngineState).avatarLoadingEffect && !getState(XRState).sessionActive && !iOS
) => {
  if (loadingEffect) {
    if (hasComponent(entity, VehicleControllerComponent)) {
      getComponent(entity, VehicleControllerComponent).movementEnabled = false
    }
  }

  setComponent(entity, VehiclePendingComponent, { url: vehicleURL })
  const parent = await loadVehicleModelAsset(vehicleURL)

  if (
    !hasComponent(entity, VehiclePendingComponent) ||
    getComponent(entity, VehiclePendingComponent).url !== vehicleURL
  )
    return

  removeComponent(entity, VehiclePendingComponent)

  if (!parent) return
  setupVehicleForUser(entity, parent)

  if (isClient && loadingEffect) {
    const vehicle = getComponent(entity, VehicleComponent)
    const effectEntity = createEntity()
    addComponent(effectEntity, VehicleEffectComponent, {
      sourceEntity: entity,
      opacityMultiplier: 1
    })
  }
}

export const setupVehicleForUser = (entity: Entity, model: Object3D) => {
  const vehicle = getComponent(entity, VehicleComponent)
  if (vehicle.model) removeObjectFromGroup(entity, vehicle.model)

  setupVehicleModel(entity)(model)
  addObjectToGroup(entity, model)
  iterateObject3D(model, (obj) => {
    obj && (obj.frustumCulled = false)
  })

  computeTransformMatrix(entity)
  updateGroupChildren(entity)

  setupVehicleHeight(entity, model)

  setObjectLayers(model, ObjectLayers.Vehicles)
  vehicle.model = model
}

export const setupVehicleModel = (entity: Entity) =>
  pipe(boneMatchVehicleModel(entity), rigVehicleModel(entity), animateVehicleModel(entity))

export const boneMatchVehicleModel = (entity: Entity) => (model: Object3D) => {
  const assetType = model.userData.type

  const groupComponent = getOptionalComponent(entity, GroupComponent)

  if (assetType == AssetType.FBX) {
    // TODO: Should probably be applied to vertexes in the modeling tool
    model.children[0].scale.setScalar(0.01)
    if (groupComponent) for (const obj of groupComponent) obj.userData.scale = 0.01
  } else if (assetType == AssetType.VRM) {
    if (model && (model as UpdateableObject3D).update) {
      setComponent(entity, UpdatableComponent, true)
      setCallback(entity, UpdatableCallback, (delta: number) => {
        ;(model as UpdateableObject3D).update(delta)
      })
    }
  }

  return model
}

export const rigVehicleModel = (entity: Entity) => (model: Object3D) => {
  const vehicleAnimationComponent = getComponent(entity, VehicleAnimationComponent)

  /*const rig = vehicleBoneMatching(model)
  const rootBone = rig.Root || rig.Hips
  rootBone.updateWorldMatrix(true, true)

  const skinnedMeshes = findSkinnedMeshes(model)

  // Try converting to T pose
  if (!hasComponent(entity, LoopAnimationComponent) && !isSkeletonInTPose(rig)) {
    makeTPose(rig)
    skinnedMeshes.forEach(applySkeletonPose)
  }

  const targetSkeleton = createSkeletonFromBone(rootBone)

  const sourceSkeleton = AnimationManager.instance._defaultSkinnedMesh.skeleton
  retargetSkeleton(targetSkeleton, sourceSkeleton)
  syncModelSkeletons(model, targetSkeleton)

  setComponent(entity, VehicleRigComponent, {
    rig,
    bindRig: vehicleBoneMatching(SkeletonUtils.clone(rootBone)),
    skinnedMeshes
  })

  const sourceHips = sourceSkeleton.bones[0]
  vehicleAnimationComponent.rootYRatio = rig.Hips.position.y / sourceHips.position.y
  */
  return model
}

export const animateVehicleModel = (entity: Entity) => (model: Object3D) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const vehicleAnimationComponent = getComponent(entity, VehicleAnimationComponent)
  const controllerComponent = getOptionalComponent(entity, VehicleControllerComponent)

  animationComponent.mixer?.stopAllAction()
  // Mixer has some issues when binding with the target skeleton
  // We have to bind the mixer with original skeleton and copy resulting bone transforms after update
  /*const sourceSkeleton = (makeDefaultSkinnedMesh().children[0] as SkinnedMesh).skeleton
  animationComponent.mixer = new AnimationMixer(sourceSkeleton.bones[0])
  animationComponent.animations = AnimationManager.instance._animations

  if (vehicleAnimationComponent)
    vehicleAnimationComponent.animationGraph = createVehicleAnimationGraph(
      entity,
      animationComponent.mixer,
      vehicleAnimationComponent.locomotion,
      controllerComponent ?? {}
    )*/

  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(1 / 60)
}

export const animateModel = (entity: Entity) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  animationComponent.mixer.clipAction(AnimationClip.findByName(animationComponent.animations, 'wave')).play()
}

export const setupVehicleMaterials = (entity, root) => {
  const materialList: Array<MaterialMap> = []
  setObjectLayers(root, ObjectLayers.Vehicles)

  root.traverse((object) => {
    if (object.isBone) object.visible = false
    if (object.material && object.material.clone) {
      const material = object.material
      materialList.push({
        id: object.uuid,
        material: material
      })
    }
  })

  return materialList
}

export const setupVehicleHeight = (entity: Entity, model: Object3D) => {
  const box = new Box3()
  box.expandByObject(model).getSize(tempVec3ForHeight)
  box.getCenter(tempVec3ForCenter)
}

/**
 * Creates an empty skinned mesh with the default skeleton attached.
 * The skeleton created is compatible with default animation tracks
 * @returns SkinnedMesh
 */
export function makeDefaultSkinnedMesh() {
  //return makeSkinnedMeshFromBoneData(defaultBonesData)
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

/*
export const getVehicleBoneWorldPosition = (entity: Entity, boneName: BoneNames, position: Vector3): boolean => {
  const vehicleRigComponent = getOptionalComponent(entity, VehicleRigComponent)
  if (!vehicleRigComponent) return false
  const bone = vehicleRigComponent.rig[boneName]
  if (!bone) return false
  const el = bone.matrixWorld.elements
  position.set(el[12], el[13], el[14])
  return true
}
*/

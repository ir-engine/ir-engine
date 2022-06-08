import { pipe } from 'bitecs'
import {
  AdditiveBlending,
  AnimationClip,
  AnimationMixer,
  Bone,
  Box3,
  DoubleSide,
  Group,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Skeleton,
  SkinnedMesh,
  sRGBEncoding,
  Vector3
} from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetType } from '../../assets/enum/AssetType'
import { AnimationManager } from '../../avatar/AnimationManager'
import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { isClient } from '../../common/functions/isClient'
import { insertAfterString, insertBeforeString } from '../../common/functions/string'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { VelocityComponent } from '../../physics/components/VelocityComponent'
import UpdateableObject3D from '../../scene/classes/UpdateableObject3D'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { Updatable } from '../../scene/interfaces/Updatable'
import { createAvatarAnimationGraph } from '../animation/AvatarAnimationGraph'
import { applySkeletonPose, isSkeletonInTPose, makeTPose } from '../animation/avatarPose'
import { retargetSkeleton, syncModelSkeletons } from '../animation/retargetSkeleton'
import avatarBoneMatching, { BoneStructure, createSkeletonFromBone, findSkinnedMeshes } from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { defaultBonesData } from '../DefaultSkeletonBones'
import { DissolveEffect } from '../DissolveEffect'
import { SkeletonUtils } from '../SkeletonUtils'
import { resizeAvatar } from './resizeAvatar'

const vec3 = new Vector3()

export const loadAvatarModelAsset = async (avatarURL: string) => {
  const model = await AssetLoader.loadAsync(avatarURL)
  const scene = model.scene || model // FBX files does not have 'scene' property
  if (!scene) return
  const parent = new Group()
  const root = new Group()
  root.add(scene)
  parent.add(root)
  parent.userData = scene.userData

  scene.traverse((obj) => {
    //TODO: To avoid the changes of the source material
    if (obj.material && obj.material.clone) {
      obj.material = obj.material.clone()
      //TODO: to fix alphablend issue of some models (mostly fbx converted models)
      obj.material.depthWrite = true
      obj.material.depthTest = true
    }
    // Enable shadow for avatars
    obj.castShadow = true
  })
  return SkeletonUtils.clone(parent)
}

export const loadAvatarForUser = async (entity: Entity, avatarURL: string) => {
  const parent = await loadAvatarModelAsset(avatarURL)
  setupAvatarForUser(entity, parent)
}

export const loadAvatarForPreview = async (entity: Entity, avatarURL: string) => {
  const parent = await loadAvatarModelAsset(avatarURL)
  if (!parent) return
  setupAvatarModel(entity)(parent)
  animateModel(entity)
  return parent
}

export const setupAvatarForUser = (entity: Entity, model: Object3D) => {
  const avatar = getComponent(entity, AvatarComponent)
  avatar.modelContainer.clear()

  setupAvatarModel(entity)(model)
  setupAvatarHeight(entity, model)

  const avatarMaterials = setupAvatarMaterials(entity, model)

  // Materials only load on the client currently
  if (isClient) {
    loadGrowingEffectObject(entity, avatarMaterials)
  }

  model.children.forEach((child) => avatar.modelContainer.add(child))
}

export const setupAvatarModel = (entity: Entity) =>
  pipe(boneMatchAvatarModel(entity), rigAvatarModel(entity), animateAvatarModel(entity))

export const boneMatchAvatarModel = (entity: Entity) => (model: Object3D) => {
  const assetType = model.userData.type

  const animationComponent = getComponent(entity, AvatarAnimationComponent)
  animationComponent.rig = avatarBoneMatching(model)
  const root = model
  const object3DComponent = getComponent(entity, Object3DComponent)

  if (assetType == AssetType.FBX) {
    // TODO: Should probably be applied to vertexes in the modeling tool
    root.children[0].scale.setScalar(0.01)
    object3DComponent.value!.userData.scale = 0.01
  } else if (assetType == AssetType.VRM) {
    if (model && object3DComponent.value && (model as UpdateableObject3D).update) {
      addComponent(entity, UpdatableComponent, {})
      ;(object3DComponent.value as unknown as Updatable).update = (delta: number) => {
        ;(model as UpdateableObject3D).update(delta)
      }
    }
  }

  return model
}

export const rigAvatarModel = (entity: Entity) => (model: Object3D) => {
  const sourceSkeleton = AnimationManager.instance._defaultSkinnedMesh.skeleton
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  const { rig } = avatarAnimationComponent
  const rootBone = rig.Root || rig.Hips
  rootBone.updateWorldMatrix(false, true)

  // Try converting to T pose
  if (!isSkeletonInTPose(rig)) {
    makeTPose(rig)
    const meshes = findSkinnedMeshes(model)
    meshes.forEach(applySkeletonPose)
  }

  const targetSkeleton = createSkeletonFromBone(rootBone)

  retargetSkeleton(targetSkeleton, sourceSkeleton)
  syncModelSkeletons(model, targetSkeleton)

  const targetHips = avatarAnimationComponent.rig.Hips
  const sourceHips = sourceSkeleton.bones[0]
  avatarAnimationComponent.rootYRatio = targetHips.position.y / sourceHips.position.y

  return model
}

export const animateAvatarModel = (entity: Entity) => (model: Object3D) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
  const velocityComponent = getComponent(entity, VelocityComponent)
  const controllerComponent = getComponent(entity, AvatarControllerComponent)

  animationComponent.mixer?.stopAllAction()
  // Mixer has some issues when binding with the target skeleton
  // We have to bind the mixer with original skeleton and copy resulting bone transforms after update
  const sourceSkeleton = makeDefaultSkinnedMesh().skeleton
  animationComponent.mixer = new AnimationMixer(sourceSkeleton.bones[0])

  if (avatarAnimationComponent)
    avatarAnimationComponent.animationGraph = createAvatarAnimationGraph(
      animationComponent.mixer,
      velocityComponent.linear,
      controllerComponent ?? {}
    )

  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(1 / 60)
}

export const animateModel = (entity: Entity) => {
  const component = getComponent(entity, LoopAnimationComponent)
  const animationComponent = getComponent(entity, AnimationComponent)
  animationComponent.animations = AnimationManager.instance._animations

  if (component.action) component.action.stop()
  component.action = animationComponent.mixer
    .clipAction(AnimationClip.findByName(animationComponent.animations, 'wave'))
    .play()
}

export const setupAvatarMaterials = (entity, root) => {
  const materialList: Array<MaterialMap> = []

  setObjectLayers(root, ObjectLayers.Avatar)
  root.traverse((object) => {
    if (object.isBone) object.visible = false
    if (object.material && object.material.clone) {
      const material = object.material.clone()
      // If local player's avatar
      if (entity === Engine.instance.currentWorld.localClientEntity) {
        setupHeadDecap(root, material)
      }
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
  box.expandByObject(model).getSize(vec3)
  resizeAvatar(entity, Math.max(vec3.x, vec3.y, vec3.z))
}

export const loadGrowingEffectObject = (entity: Entity, originalMatList: Array<MaterialMap>) => {
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

  if (hasComponent(entity, AvatarPendingComponent)) removeComponent(entity, AvatarPendingComponent)
  addComponent(entity, AvatarPendingComponent, {
    light: lightMesh,
    plate: plateMesh
  })
  if (hasComponent(entity, AvatarEffectComponent)) removeComponent(entity, AvatarEffectComponent)
  addComponent(entity, AvatarEffectComponent, {
    opacityMultiplier: 0,
    originMaterials: originalMatList
  })
}

/**
 * Creates an empty skinned mesh with the default skeleton attached.
 * The skeleton created is compatible with default animation tracks
 * @returns SkinnedMesh
 */
export function makeDefaultSkinnedMesh(): SkinnedMesh {
  return makeSkinnedMeshFromBoneData(defaultBonesData)
}

/**
 * Creates an empty skinned mesh using list of bones to build skeleton structure
 * @returns SkinnedMesh
 */
export function makeSkinnedMeshFromBoneData(bonesData): SkinnedMesh {
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
  const skinnedMesh = new SkinnedMesh()
  const skeleton = new Skeleton(bones)
  skinnedMesh.bind(skeleton)
  group.add(skinnedMesh)
  group.add(hipBone)

  return skinnedMesh
}

/**
 * Adds required parameters to mesh's material
 * to enable avatar's head decapitation (opacity fade)
 * @param model
 * @param material
 */
function setupHeadDecap(model: Object3D, material: Material) {
  const mesh = model.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh

  if (!mesh) {
    console.warn("Could not find object's SkinnedMesh", model)
    return
  }

  const bones = mesh.skeleton.bones
  const headBone = bones.find((bone) => /head/i.test(bone.name))

  if (!headBone) {
    console.warn("Could not find SkinnedMesh's head bone", mesh)
    return
  }

  // Create a copy of the mesh to hide 'internal' polygons when opacity is below 1
  const skinnedMeshMask = SkeletonUtils.clone(model).getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh
  mesh.parent?.add(skinnedMeshMask)
  skinnedMeshMask.skeleton = mesh.skeleton
  skinnedMeshMask.bindMatrix = mesh.bindMatrix
  skinnedMeshMask.bindMatrixInverse = mesh.bindMatrixInverse
  skinnedMeshMask.material = new MeshBasicMaterial({ skinning: true, colorWrite: false } as any)
  skinnedMeshMask.name = skinnedMeshMask.name + '_Mask'
  skinnedMeshMask.renderOrder = 1
  ;(mesh.material as any).depthWrite = false

  const bonesIndexes = getBoneChildrenIndexes(bones, headBone)
  const bonesToFade = new Matrix4()
  bonesToFade.elements.fill(-1)
  const loopLength = Math.min(bonesToFade.elements.length, bonesIndexes.length)

  for (let i = 0; i < loopLength; i++) {
    bonesToFade.elements[i] = bonesIndexes[i]
  }

  addBoneOpacityParamsToMaterial(material, bonesToFade)
}

/**
 * Returns list of a bone's child indexes in bones list
 * including the starting bone
 * @param bones list of bones to search
 * @param startingBone bone to find childrend index from
 * @returns
 */
function getBoneChildrenIndexes(bones: Object3D[], startingBone: Object3D): number[] {
  const indexes: number[] = []

  startingBone.traverse((c) => {
    indexes.push(bones.findIndex((b) => c.name === b.name))
  })

  return indexes
}

/**
 * Adds opacity setting to a material based on single bone
 *
 * @param material
 * @param boneIndexes
 */
export function addBoneOpacityParamsToMaterial(material, boneIndexes: Matrix4) {
  material.transparent = true
  material.needsUpdate = true
  material.onBeforeCompile = (shader, renderer) => {
    shader.uniforms.boneIndexToFade = { value: boneIndexes }
    shader.uniforms.boneOpacity = { value: 1.0 }

    // Vertex Uniforms
    const vertexUniforms = `uniform mat4 boneIndexToFade;
      varying float vSelectedBone;`

    shader.vertexShader = insertBeforeString(shader.vertexShader, 'varying vec3 vViewPosition;', vertexUniforms)

    shader.vertexShader = insertAfterString(
      shader.vertexShader,
      '#include <skinning_vertex>',
      `
      vSelectedBone = 0.0;

      for(float i=0.0; i<16.0 && vSelectedBone == 0.0; i++){
          int x = int(i/4.0);
          int y = int(mod(i,4.0));
          float boneIndex = boneIndexToFade[x][y];
          if(boneIndex < 0.0) continue;

          for(int j=0; j<4; j++){
              if(skinIndex[j] == boneIndex){
                  vSelectedBone = 1.0;
                  break;
              }
          }
      }
      `
    )

    // Fragment Uniforms
    const fragUniforms = `varying float vSelectedBone;
      uniform float boneOpacity;
      `

    shader.fragmentShader = insertBeforeString(shader.fragmentShader, 'uniform vec3 diffuse;', fragUniforms)

    shader.fragmentShader = insertAfterString(
      shader.fragmentShader,
      'vec4 diffuseColor = vec4( diffuse, opacity );',
      `if(vSelectedBone > 0.0){
          diffuseColor.a = opacity * boneOpacity;
      }
      `
    )

    material.userData.shader = shader
  }
}

export const setAvatarHeadOpacity = (entity: Entity, opacity: number): void => {
  const object3DComponent = getComponent(entity, Object3DComponent)
  object3DComponent?.value.traverse((obj) => {
    if (!(obj as SkinnedMesh).isSkinnedMesh) return
    const material = (obj as SkinnedMesh).material as Material
    if (!material.userData?.shader) return
    const shader = material.userData.shader
    if (shader?.uniforms) {
      shader.uniforms.boneOpacity.value = opacity
    }
  })
}

export const getAvatarBoneWorldPosition = (entity: Entity, boneName: string, position: Vector3): boolean => {
  const animationComponent = getComponent(entity, AvatarAnimationComponent)
  if (!animationComponent) return false
  const bone = animationComponent.rig[boneName]
  if (!bone) return false
  bone.updateWorldMatrix(true, false)
  const el = bone.matrixWorld.elements
  position.set(el[12], el[13], el[14])
  return true
}

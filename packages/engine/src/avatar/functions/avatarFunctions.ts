import {
  AdditiveBlending,
  AnimationMixer,
  Bone,
  DoubleSide,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  RGBAFormat,
  Skeleton,
  SkinnedMesh,
  sRGBEncoding,
  Vector3
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { AssetType } from '../../assets/enum/AssetType'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { AnimationRenderer } from '../animations/AnimationRenderer'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { Entity } from '../../ecs/classes/Entity'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { AvatarEffectComponent, MaterialMap } from '../components/AvatarEffectComponent'
import { DissolveEffect } from '../DissolveEffect'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { bonesData2 } from '../DefaultSkeletonBones'
import { addRig, addTargetRig } from '../../ikrig/functions/RigFunctions'
import { defaultIKPoseComponentValues, IKPoseComponent } from '../../ikrig/components/IKPoseComponent'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { insertAfterString, insertBeforeString } from '../../common/functions/string'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { IKRigComponent } from '../../ikrig/components/IKRigComponent'
import AvatarBoneMatching, { BoneStructure } from '../AvatarBoneMatching'
import { UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { Updatable } from '../../scene/interfaces/Updatable'
import { pipe } from 'bitecs'
import UpdateableObject3D from '../../scene/classes/UpdateableObject3D'
import { isClient } from '../../common/functions/isClient'

const vec3 = new Vector3()

export const loadAvatarForUser = async (entity: Entity, avatarURL: string) => {
  const model = await AssetLoader.loadAsync({
    url: avatarURL,
    castShadow: true,
    receiveShadow: true
  })
  const parent = new Group()
  const root = new Group()
  root.add(model.scene)
  parent.add(root)
  parent.userData = model.scene.userData
  setupAvatarForUser(entity, SkeletonUtils.clone(parent))
}

export const setupAvatarForUser = (entity: Entity, model: Object3D) => {
  const avatar = getComponent(entity, AvatarComponent)
  avatar.modelContainer.children.forEach((child) => child.removeFromParent())

  setupAvatarModel(entity)(model)
  setupAvatarHeight(entity, getComponent(entity, IKRigComponent).boneStructure)

  const avatarMaterials = setupAvatarMaterials(model)

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

  const boneStructure = AvatarBoneMatching(model)
  const rootBone = boneStructure.Root

  if (assetType == AssetType.FBX) {
    rootBone.children[0].scale.setScalar(0.01)
    const object3DComponent = getComponent(entity, Object3DComponent)
    object3DComponent.value!.userData.scale = 0.01
  } else if (assetType == AssetType.VRM) {
    if (model) {
      //@ts-ignore
      const object3DComponent = getComponent(entity, Object3DComponent)
      if (object3DComponent.value && (model as UpdateableObject3D).update) {
        //@ts-ignore
        addComponent(entity, UpdatableComponent, {})
        ;(object3DComponent.value as unknown as Updatable).update = (delta: number) => {
          ;(model as UpdateableObject3D).update(delta)
        }
      }
    }
  }

  return boneStructure
}

export const rigAvatarModel = (entity: Entity) => (boneStructure: BoneStructure) => {
  const rootBone = boneStructure.Root

  addTargetRig(entity, rootBone, null, false)

  if (hasComponent(entity, IKPoseComponent)) removeComponent(entity, IKPoseComponent)
  addComponent(entity, IKPoseComponent, defaultIKPoseComponentValues())

  // animation will be applied to this skeleton instead of avatar
  const sourceSkeletonRoot: Group = SkeletonUtils.clone(getDefaultSkeleton().parent)
  rootBone.add(sourceSkeletonRoot)
  addRig(entity, sourceSkeletonRoot)
  getComponent(entity, IKRigComponent).boneStructure = boneStructure

  return sourceSkeletonRoot
}

export const animateAvatarModel = (entity: Entity) => (sourceSkeletonRoot: Group) => {
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  animationComponent.mixer?.stopAllAction()

  animationComponent.mixer = new AnimationMixer(sourceSkeletonRoot)
  if (avatarAnimationComponent?.currentState) {
    AnimationRenderer.mountCurrentState(entity)
  }
  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(1 / 60)
}

export const setupAvatarMaterials = (root) => {
  const materialList: Array<MaterialMap> = []

  setObjectLayers(root, ObjectLayers.Avatar)
  root.traverse((object) => {
    if (object.isBone) object.visible = false
    if (object.material && object.material.clone) {
      // Transparency fix
      object.material.format = RGBAFormat
      const material = object.material.clone()
      addBoneOpacityParamsToMaterial(material, 5) // Head bone
      materialList.push({
        id: object.uuid,
        material: material
      })
      object.material = DissolveEffect.getDissolveTexture(object)
    }
  })

  return materialList
}

export const setupAvatarHeight = (entity: Entity, boneStructure: BoneStructure) => {
  const eyeTarget = boneStructure.LeftEye ?? boneStructure.Head ?? boneStructure.Neck
  boneStructure.Neck.updateMatrixWorld(true)
  boneStructure.Root.updateMatrixWorld(true)
  const avatar = getComponent(entity, AvatarComponent)
  avatar.avatarHeight = eyeTarget.getWorldPosition(vec3).y - boneStructure.Root.getWorldPosition(vec3).y
  avatar.avatarHalfHeight = avatar.avatarHeight / 2
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

export function getDefaultSkeleton(): SkinnedMesh {
  const bones: Bone[] = []
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

/**
 * Adds opacity setting to a material based on single bone
 *
 * @param material
 * @param boneIndex
 */
export const addBoneOpacityParamsToMaterial = (material, boneIndex = -1) => {
  material.transparent = true
  material.onBeforeCompile = (shader, renderer) => {
    shader.uniforms.boneIndexToFade = { value: boneIndex }
    shader.uniforms.boneWeightThreshold = { value: 0.9 }
    shader.uniforms.boneOpacity = { value: 1.0 }

    // Vertex Uniforms
    const vertexUniforms = `uniform float boneIndexToFade;
      uniform float boneWeightThreshold;
      varying float vSelectedBone;`

    shader.vertexShader = insertBeforeString(shader.vertexShader, 'varying vec3 vViewPosition;', vertexUniforms)

    shader.vertexShader = insertAfterString(
      shader.vertexShader,
      '#include <skinning_vertex>',
      `
      vSelectedBone = 0.0;

      if((skinIndex.x == boneIndexToFade && skinWeight.x >= boneWeightThreshold) || 
      (skinIndex.y == boneIndexToFade && skinWeight.y >= boneWeightThreshold) ||
      (skinIndex.z == boneIndexToFade && skinWeight.z >= boneWeightThreshold) ||
      (skinIndex.w == boneIndexToFade && skinWeight.w >= boneWeightThreshold)){
          vSelectedBone = 1.0;
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
  const rig = getComponent(entity, IKRigComponent)
  const bone = rig.boneStructure[boneName]
  if (!bone) return false
  bone.updateWorldMatrix(true, false)
  const el = bone.matrixWorld.elements
  position.set(el[12], el[13], el[14])
  return true
}

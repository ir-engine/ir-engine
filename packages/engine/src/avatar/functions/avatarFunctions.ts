import {
  AdditiveBlending,
  AnimationMixer,
  Bone,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  RGBAFormat,
  Skeleton,
  SkeletonHelper,
  SkinnedMesh,
  sRGBEncoding
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
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
import { ArmatureType } from '../../ikrig/enums/ArmatureType'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { AvatarProps } from '../../networking/interfaces/WorldState'
import { insertAfterString, insertBeforeString } from '../../common/functions/string'

import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'

export const loadAvatarForEntity = (entity: Entity, avatarDetail: AvatarProps) => {
  avatarDetail.avatarURL = 'https://172.160.10.156:8642/avatars/public/new/Geoff.glb'
  AssetLoader.load(
    {
      url: avatarDetail.avatarURL,
      castShadow: true,
      receiveShadow: true
    },
    (gltf: any) => {
      console.log('loadAvatarForEntity', gltf.scene)
      setupAvatar(entity, SkeletonUtils.clone(gltf.scene), avatarDetail.avatarURL)
    }
  )
}

export const setAvatarLayer = (obj: Object3D) => {
  setObjectLayers(obj, ObjectLayers.Render, ObjectLayers.Avatar)
}

const setupAvatar = (entity: Entity, model: any, avatarURL?: string) => {
  const world = useWorld()

  if (!entity) return

  const avatar = getComponent(entity, AvatarComponent)
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  let hips = model

  model.traverse((o) => {
    // TODO: Remove me when we add retargeting
    // TODO: For mixamorig
    if (o.name?.includes('mixamorig')) {
      o.name = o.name.replace('mixamorig', '')
    }
    // TODO: For VRM
    else if (o.name?.includes('J_Bip_')) {
      o.name = o.name
        .replace('J_Bip_C_Hips', 'Hips')
        .replace('J_Bip_C_Spine', 'Spine')
        .replace('J_Bip_C_Chest', 'Spine1')
        .replace('J_Bip_C_Neck', 'Neck')
        .replace('J_Bip_C_Head', 'Head')

        .replace('J_Adj_L_FaceEye', 'LeftEye')
        .replace('J_Adj_R_FaceEye', 'RightEye')

        .replace('J_Bip_L_Shoulder', 'LeftShoulder')
        .replace('J_Bip_L_UpperArm', 'LeftArm')
        .replace('J_Bip_L_LowerArm', 'LeftForeArm')
        .replace('J_Bip_L_Hand', 'LeftHand')

        .replace('J_Bip_R_Shoulder', 'RightShoulder')
        .replace('J_Bip_R_UpperArm', 'RightArm')
        .replace('J_Bip_R_LowerArm', 'RightForeArm')
        .replace('J_Bip_R_Hand', 'RightHand')

        .replace('J_Bip_L_UpperLeg', 'LeftUpLeg')
        .replace('J_Bip_L_LowerLeg', 'LeftLeg')
        .replace('J_Bip_L_Foot', 'LeftFoot')

        .replace('J_Bip_R_UpperLeg', 'RightUpLeg')
        .replace('J_Bip_R_LowerLeg', 'RightLeg')
        .replace('J_Bip_R_Foot', 'RightFoot')
    } else {
      o.name = o.name
        .replace('root', 'Hips')
        .replace('pelvis', 'Spine')
        .replace('spine_01', 'Spine1')
        .replace('spine_02', 'Spine2')

        .replace('neck_01', 'Neck')
        .replace('head', 'Head')
        .replace('CC_Base_R_Eye', 'LeftEye')
        .replace('CC_Base_L_Eye', 'RightEye')

        .replace('clavicle_l', 'LeftShoulder')
        .replace('upperarm_l', 'LeftArm')
        .replace('lowerarm_l', 'LeftForeArm')
        .replace('hand_l', 'LeftHand')

        .replace('clavicle_r', 'RightShoulder')
        .replace('upperarm_r', 'RightArm')
        .replace('lowerarm_r', 'RightForeArm')
        .replace('hand_r', 'RightHand')

        .replace('thigh_l', 'LeftUpLeg')
        .replace('calf_l', 'LeftLeg')
        .replace('foot_l', 'LeftFoot')
        .replace('ball_l', 'LeftToeBase')

        .replace('thigh_r', 'RightUpLeg')
        .replace('calf_r', 'RightLeg')
        .replace('foot_r', 'RightFoot')
        .replace('ball_r', 'RightToeBase')
    }
    if (o.name?.toLowerCase().includes('hips')) hips = o
  })

  const loadedAvatarBoneNames: string[] = []
  hips.traverse((child) => loadedAvatarBoneNames.push(child.name))

  console.log(loadedAvatarBoneNames)
  debugger

  animationComponent.mixer.stopAllAction()
  avatar.modelContainer.children.forEach((child) => child.removeFromParent())

  let materialList: Array<MaterialMap> = []

  model.traverse((object) => {
    if (object.isBone) object.visible = false
    setAvatarLayer(object)

    if (object.material) {
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

  model.children.forEach((child) => avatar.modelContainer.add(child))

  // TODO: find skinned mesh in avatar.modelContainer
  const avatarSkinnedMesh = avatar.modelContainer.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh
  const rootBone = avatarSkinnedMesh.skeleton.bones.find((b) => b.parent!.type !== 'Bone')

  // TODO: add way to handle armature type
  const armatureType = avatarURL?.includes('trex') ? ArmatureType.TREX : ArmatureType.MIXAMO
  addTargetRig(entity, rootBone?.parent!, null, false, armatureType)

  if (hasComponent(entity, IKPoseComponent)) removeComponent(entity, IKPoseComponent)
  addComponent(entity, IKPoseComponent, defaultIKPoseComponentValues())

  // animation will be applied to this skeleton instead of avatar
  const sourceSkeletonRoot: Group = SkeletonUtils.clone(getDefaultSkeleton().parent)
  rootBone?.parent!.add(sourceSkeletonRoot)
  addRig(entity, sourceSkeletonRoot)
  animationComponent.mixer = new AnimationMixer(sourceSkeletonRoot)
  const retargetedBones: string[] = []

  sourceSkeletonRoot.traverse((child) => {
    if (child.name) retargetedBones.push(child.name)
  })

  retargetedBones.forEach((r) => {
    if (!loadedAvatarBoneNames.includes(r)) console.warn(`[Avatar Loader]: Bone '${r}' not found`)
  })

  loadedAvatarBoneNames.forEach((r) => {
    if (!retargetedBones.includes(r)) console.warn(`[Avatar Loader]: Bone '${r}' not supported`)
  })

  if (avatarAnimationComponent.currentState) {
    AnimationRenderer.mountCurrentState(entity)
  }

  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(world.delta)

  const helper = new SkeletonHelper(sourceSkeletonRoot)
  const newEntity = createEntity()
  addComponent(newEntity, Object3DComponent, { value: helper })
  loadGrowingEffectObject(entity, materialList)
}

const loadGrowingEffectObject = (entity: Entity, originalMatList: Array<MaterialMap>) => {
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
const addBoneOpacityParamsToMaterial = (material, boneIndex = -1) => {
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

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
import { ArmatureType } from '../../ikrig/enums/ArmatureType'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { AvatarProps } from '../../networking/interfaces/WorldState'
import { insertAfterString, insertBeforeString } from '../../common/functions/string'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import AvatarBoneMatching from '@xrengine/engine/src/avatar/AvatarBoneMatching'
import { IKRigComponent } from '../../ikrig/components/IKRigComponent'
import { UpdatableComponent } from '@xrengine/engine/src/scene/components/UpdatableComponent'
import { Updatable } from '@xrengine/engine/src/scene/interfaces/Updatable'
const vec3 = new Vector3()

export const loadAvatarForEntity = (entity: Entity, avatarDetail: AvatarProps) => {
  AssetLoader.load(
    {
      url: avatarDetail.avatarURL,
      castShadow: true,
      receiveShadow: true
    },
    (model: any) => {
      const parent = new Group()
      parent.add(model.scene)
      const root = new Group()
      root.add(model.scene)
      parent.add(root)
      setupAvatar(entity, SkeletonUtils.clone(parent), avatarDetail.avatarURL, model)
    }
  )
}

export const setAvatarLayer = (obj: Object3D) => {
  setObjectLayers(obj, ObjectLayers.Render, ObjectLayers.Avatar)
}

const setupAvatar = (entity: Entity, root: any, avatarURL?: string, model?: any) => {
  const assetType = model.scene.userData.type

  const world = useWorld()

  if (!entity) return

  const avatar = getComponent(entity, AvatarComponent)
  const animationComponent = getComponent(entity, AnimationComponent)
  const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

  animationComponent.mixer.stopAllAction()
  avatar.modelContainer.children.forEach((child) => child.removeFromParent())

  const retargeted = AvatarBoneMatching(root)
  const rootBone = retargeted.Root

  if (assetType == AssetType.FBX) {
    rootBone.children[0].scale.setScalar(0.01)
  } else if (assetType == AssetType.VRM) {
    if (model) {
      //@ts-ignore
      addComponent(entity, UpdatableComponent, {})
      //@ts-ignore
      const object3DComponent = getComponent(entity, Object3DComponent)
      if (object3DComponent.value) {
        ;(object3DComponent.value as unknown as Updatable).update = function () {
          model.update()
        }
      }
    }
  }

  // TODO: add way to handle armature type
  const armatureType = avatarURL?.includes('trex') ? ArmatureType.TREX : ArmatureType.MIXAMO
  const targetRig = addTargetRig(entity, rootBone, null, false, armatureType)

  if (hasComponent(entity, IKPoseComponent)) removeComponent(entity, IKPoseComponent)
  addComponent(entity, IKPoseComponent, defaultIKPoseComponentValues())

  // animation will be applied to this skeleton instead of avatar
  const sourceSkeletonRoot: Group = SkeletonUtils.clone(getDefaultSkeleton().parent)
  rootBone.add(sourceSkeletonRoot)
  addRig(entity, sourceSkeletonRoot)
  getComponent(entity, IKRigComponent).boneStructure = retargeted

  animationComponent.mixer = new AnimationMixer(sourceSkeletonRoot)
  if (avatarAnimationComponent.currentState) {
    AnimationRenderer.mountCurrentState(entity)
  }

  // advance animation for a frame to eliminate potential t-pose
  animationComponent.mixer.update(world.delta)

  const eyeTarget = retargeted.LeftEye ?? retargeted.Head ?? retargeted.Neck
  root.updateMatrixWorld(true)
  avatar.avatarHeight = eyeTarget.getWorldPosition(vec3).y - root.getWorldPosition(vec3).y

  // Material
  let materialList: Array<MaterialMap> = []
  root.traverse((object) => {
    if (object.isBone) object.visible = false
    setAvatarLayer(object)
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
  loadGrowingEffectObject(entity, materialList)
  root.children.forEach((child) => avatar.modelContainer.add(child))
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

export const setAvatarHeadOpacity = (entity: Entity, opacity: number): void => {
  const object3DComponent = getComponent(entity, Object3DComponent)
  object3DComponent?.value.traverse((obj) => {
    if (!(obj as SkinnedMesh).isSkinnedMesh) return
    const material = (obj as SkinnedMesh).material as Material
    if (!material.userData.shader) return
    const shader = material.userData.shader
    shader.uniforms.boneOpacity.value = opacity
  })
}

export const getAvatarBoneWorldPosition = (entity: Entity, name: string, position: Vector3): void => {
  const object3DComponent = getComponent(entity, Object3DComponent)
  let found = false
  object3DComponent?.value.traverse((obj) => {
    const bone = obj as Bone
    // TODO: Cache the neck bone reference
    if (found || !bone.isBone || !bone.name.toLowerCase().includes(name)) return
    bone.updateWorldMatrix(true, false)
    const el = bone.matrixWorld.elements
    position.set(el[12], el[13], el[14])
    found = true
  })
}

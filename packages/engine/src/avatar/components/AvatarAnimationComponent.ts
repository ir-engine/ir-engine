/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import {
  VRM,
  VRM1Meta,
  VRMHumanBone,
  VRMHumanBoneList,
  VRMHumanBoneName,
  VRMHumanBones,
  VRMHumanoid,
  VRMParameters
} from '@pixiv/three-vrm'
import type * as V0VRM from '@pixiv/types-vrm-0.0'

import { AnimationAction, Euler, Group, Matrix4, Object3D, Vector3 } from 'three'

import { GLTF } from '@gltf-transform/core'
import { UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getState } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFDocumentState } from '../../gltf/GLTFDocumentState'
import { hipsRegex, mixamoVRMRigMap } from '../AvatarBoneMatching'
import { NormalizedBoneComponent } from './NormalizedBoneComponent'

/**@todo refactor into generalized AnimationGraphComponent */
export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  schema: S.Object({
    animationGraph: S.Object({
      blendAnimation: S.Optional(S.Type<AnimationAction>()),
      fadingOut: S.Bool(false),
      blendStrength: S.Number(0),
      layer: S.Number(0)
    }),
    /** The input vector for 2D locomotion blending space */
    locomotion: T.Vec3()
  })
})

export type Matrices = { local: Matrix4; world: Matrix4 }

const HumanBonesSchema = S.LiteralUnion(VRMHumanBoneList)

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: S.Object({
    /** maps human bones to entities */
    bonesToEntities: S.Record(HumanBonesSchema, S.Entity()),
    entitiesToBones: S.Record(S.Entity(), HumanBonesSchema),

    /** contains ik solve data */
    /**@todo create and move to AvatarIKComponent */
    ikMatrices: S.Record(
      S.LiteralUnion(Object.values(VRMHumanBoneName)),
      S.Object({
        local: T.Mat4(),
        world: T.Mat4()
      }),
      {}
    ),
    /** The VRM model */
    vrm: S.Type<VRM>()
  }),

  setBone: (toRigEntity: Entity, boneEntity: Entity, boneName: VRMHumanBoneName) => {
    const rigComponent = getMutableComponent(toRigEntity, AvatarRigComponent)
    rigComponent.bonesToEntities[boneName].set(boneEntity)
    rigComponent.entitiesToBones[boneEntity].set(boneName)
  },

  useAvatarLoaded: (entity: Entity) => {
    return !!useOptionalComponent(entity, AvatarRigComponent)?.vrm.value
  },

  errors: ['UNSUPPORTED_AVATAR']
})

const _rightHandPos = new Vector3(),
  _rightUpperArmPos = new Vector3()

const linkNormalizedBones = (vrm: VRM) => {
  for (const bone in vrm.humanoid.rawHumanBones)
    if (vrm.humanoid.rawHumanBones[bone]?.node && vrm.humanoid.normalizedHumanBones[bone]?.node) {
      setComponent(
        vrm.humanoid.rawHumanBones[bone].node.entity,
        NormalizedBoneComponent,
        vrm.humanoid.normalizedHumanBones[bone].node
      )
    }
}

export function createVRM(rootEntity: Entity) {
  const documentID = GLTFComponent.getInstanceID(rootEntity)
  const gltf = getState(GLTFDocumentState)[documentID]

  //formats an object of human bones to be used in the VRM constructor
  const formatHumanBones = (humanBones: { [key: string]: { node: number } }) => {
    const bones = [] as V0VRM.HumanoidBone[]
    for (const bone in humanBones) {
      bones.push({ bone: bone as V0VRM.HumanoidBoneName, node: humanBones[bone].node })
    }
    return bones
  }

  if (!hasComponent(rootEntity, ObjectComponent)) {
    const obj3d = new Group()
    setComponent(rootEntity, ObjectComponent, obj3d)
  }

  if (gltf.extensions?.VRM || gltf.extensions?.VRMC_vrm) {
    const vrmExtensionDefinition = (gltf.extensions!.VRM as V0VRM.VRM) ?? (gltf.extensions.VRMC_vrm as V0VRM.VRM)
    const humanBonesArray = Array.isArray(vrmExtensionDefinition.humanoid?.humanBones)
      ? vrmExtensionDefinition.humanoid?.humanBones
      : formatHumanBones(vrmExtensionDefinition.humanoid!.humanBones as any)
    const bones = humanBonesArray.reduce((bones, bone) => {
      const nodeID = `${documentID}-${bone.node}` as EntityUUID
      const entity = UUIDComponent.getEntityByUUID(nodeID)
      AvatarRigComponent.setBone(rootEntity, entity, bone.bone as VRMHumanBoneName)
      bones[bone.bone!] = { node: getComponent(entity, BoneComponent) }
      return bones
    }, {} as VRMHumanBones)

    /**hacky, @todo test with vrm1 */
    iterateEntityNode(rootEntity, (entity) => {
      const bone = getOptionalComponent(entity, BoneComponent)
      bone?.matrixWorld.identity()
      bone?.quaternion.set(0, 0, 0, 1)
      if (entity !== bones.hips.node.parent?.entity) bone?.matrixWorld.makeRotationY(Math.PI)
    })
    bones.hips.node.rotateY(Math.PI)

    const humanoid = new VRMHumanoid(bones)

    const scene = getComponent(rootEntity, ObjectComponent)

    const meta = vrmExtensionDefinition.meta! as any

    const vrm = new VRM({
      humanoid,
      scene,
      meta
      // expressionManager: gltf.userData.vrmExpressionManager,
      // firstPerson: gltf.userData.vrmFirstPerson,
      // lookAt: gltf.userData.vrmLookAt,
      // materials: gltf.userData.vrmMToonMaterials,
      // springBoneManager: gltf.userData.vrmSpringBoneManager,
      // nodeConstraintManager: gltf.userData.vrmNodeConstraintManager,
    } as VRMParameters)

    setComponent(rootEntity, AvatarRigComponent, { vrm })
    linkNormalizedBones(vrm)

    return vrm
  }

  return createVRMFromGLTF(rootEntity, gltf)
}

export const createVRMFromGLTF = (rootEntity: Entity, gltf: GLTF.IGLTF) => {
  const hipsEntity = iterateEntityNode(
    rootEntity,
    (entity) => entity,
    (entity) => (hasComponent(entity, NameComponent) ? hipsRegex.test(getComponent(entity, NameComponent)) : false),
    false,
    true
  )?.[0]

  const hipsName = getComponent(hipsEntity, NameComponent)

  const hipsParent = getOptionalComponent(hipsEntity, EntityTreeComponent)?.parentEntity
  if (!hasComponent(hipsParent!, ObjectComponent)) setComponent(hipsParent!, ObjectComponent, new Object3D())

  const bones = {} as VRMHumanBones

  /**
   * some mixamo rigs do not use the mixamo prefix, if they don't, we add
   * a prefix to the rig names for matching to keys in the mixamoVRMRigMap
   */
  const mixamoPrefix = hipsName.includes('mixamorig') ? '' : 'mixamorig'
  /**
   * some mixamo rigs have an identifier or suffix after the mixamo prefix
   * that must be removed for matching to keys in the mixamoVRMRigMap
   */
  const removeSuffix = mixamoPrefix ? false : !/[hp]/i.test(hipsName.charAt(9))

  iterateEntityNode(rootEntity, (entity) => {
    const transform = getOptionalComponent(entity, TransformComponent)
    transform?.matrixWorld.identity()

    if (entity === rootEntity) return

    const name = getOptionalComponent(entity, NameComponent)
    if (!name) return

    /**match the keys to create a humanoid bones object */
    let boneName = mixamoPrefix + name

    if (removeSuffix) boneName = boneName.slice(0, 9) + name.slice(10)

    //remove colon from the bone name
    if (boneName.includes(':')) boneName = boneName.replace(':', '')

    const bone = mixamoVRMRigMap[boneName] as string
    if (bone) {
      if (transform && hasComponent(entity, BoneComponent)) transform.rotation.set(0, 0, 0, 1)
      const node = getComponent(entity, BoneComponent)
      bones[bone] = { node } as VRMHumanBone
      AvatarRigComponent.setBone(rootEntity, entity, bone as VRMHumanBoneName)
      setComponent(entity, NormalizedBoneComponent, node)
    }
  })
  enforceTPose(rootEntity)
  const humanoid = new VRMHumanoid(bones)
  const scene = getComponent(rootEntity, ObjectComponent)
  const children = getComponent(rootEntity, EntityTreeComponent).children
  const childName = getComponent(children[0], NameComponent)

  const vrm = new VRM({
    humanoid,
    scene,
    meta: { name: childName } as VRM1Meta
    // expressionManager: gltf.userData.vrmExpressionManager,
    // firstPerson: gltf.userData.vrmFirstPerson,
    // lookAt: gltf.userData.vrmLookAt,
    // materials: gltf.userData.vrmMToonMaterials,
    // springBoneManager: gltf.userData.vrmSpringBoneManager,
    // nodeConstraintManager: gltf.userData.vrmNodeConstraintManager,
  } as VRMParameters)

  setComponent(rootEntity, AvatarRigComponent, { vrm })
  linkNormalizedBones(vrm)

  if (!vrm.userData) vrm.userData = {}
  humanoid.humanBones.rightHand.node.getWorldPosition(_rightHandPos)
  humanoid.humanBones.rightUpperArm.node.getWorldPosition(_rightUpperArmPos)

  return vrm
}

const shoulderAngle = {
  rightShoulderAngle: new Euler(Math.PI / 2, 0, Math.PI / 2),
  leftShoulderAngle: new Euler(Math.PI / 2, 0, -Math.PI / 2)
}
const thumbAngle = {
  rightThumbAngle: new Euler(Math.PI / 6, 0, -Math.PI / 6),
  leftThumbAngle: new Euler(Math.PI / 6, 0, Math.PI / 6)
}
const legAngle = new Euler(0, 0, Math.PI)
const footAngle = new Euler(Math.PI / 3.25, 0, 0)
const toesAngle = new Euler(Math.PI / 6, 0, 0)

/**Rewrites avatar's bone quaternions and matrices to create a T-Pose, assuming all bones are the identity quaternion */
export const enforceTPose = (entity: Entity) => {
  const bones = getComponent(entity, AvatarRigComponent).bonesToEntities
  const poseArm = (side: 'left' | 'right') => {
    const shoulder = bones[`${side}Shoulder`]
    const angle = shoulderAngle[`${side}ShoulderAngle`]
    const shoulderTransform = getComponent(shoulder, TransformComponent)
    shoulderTransform.rotation.setFromEuler(angle)
    iterateEntityNode(shoulder, (entity) => {
      getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(angle)
    })
  }

  const poseLeg = (side: 'left' | 'right') => {
    const upperLeg = bones[`${side}UpperLeg`]
    getComponent(upperLeg, TransformComponent).rotation.setFromEuler(legAngle)
    iterateEntityNode(upperLeg, (entity) => {
      getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(legAngle)
    })
  }

  const poseFoot = (side: 'left' | 'right') => {
    const foot = bones[`${side}Foot`]
    const toes = bones[`${side}Toes`]
    getComponent(foot, TransformComponent).rotation.setFromEuler(footAngle)
    iterateEntityNode(foot, (entity) => {
      getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(footAngle)
    })
    getOptionalComponent(toes, TransformComponent)?.rotation.setFromEuler(toesAngle)
  }

  const poseThumbs = (side: 'left' | 'right') => {
    const thumb = bones[`${side}ThumbMetacarpal`]
    const angle = thumbAngle[`${side}ThumbAngle`]
    const hand = bones[`${side}Hand`]
    getComponent(thumb, TransformComponent).rotation.setFromEuler(angle)
    iterateEntityNode(thumb, (entity) => {
      getComponent(entity, BoneComponent)
        .matrixWorld.makeRotationFromEuler(angle)
        .multiply(getComponent(hand, TransformComponent).matrixWorld)
    })
  }

  poseArm('right')
  poseArm('left')

  poseLeg('right')
  poseLeg('left')

  poseFoot('right')
  poseFoot('left')

  poseThumbs('right')
  poseThumbs('left')
}

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
  VRMHumanBoneName,
  VRMHumanBones,
  VRMHumanoid,
  VRMParameters
} from '@pixiv/three-vrm'
import type * as V0VRM from '@pixiv/types-vrm-0.0'

import { useEffect } from 'react'
import { AnimationAction, Bone, Euler, Group, Matrix4, Vector3 } from 'three'

import { GLTF } from '@gltf-transform/core'
import { UUIDComponent } from '@ir-engine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { getMutableState, getState, useHookstate } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFDocumentState } from '../../gltf/GLTFDocumentState'
import { addError, removeError } from '../../scene/functions/ErrorFunctions'
import { proxifyParentChildRelationships } from '../../scene/functions/loadGLTFModel'
import { AnimationState } from '../AnimationManager'
import { hipsRegex, mixamoVRMRigMap } from '../AvatarBoneMatching'
import { preloadedAnimations } from '../animation/Util'
import {
  setAvatarAnimations,
  setAvatarSpeedFromRootMotion,
  setupAvatarForUser,
  setupAvatarProportions
} from '../functions/avatarFunctions'

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
    locomotion: S.Vec3()
  })
})

export type Matrices = { local: Matrix4; world: Matrix4 }

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: S.Object({
    /** rig bones with quaternions relative to the raw bones in their bind pose */
    normalizedRig: S.Type<VRMHumanBones>(),
    /** contains the raw bone quaternions */
    rawRig: S.Type<VRMHumanBones>(),
    /** contains ik solve data */
    ikMatrices: S.Record(
      S.LiteralUnion(Object.values(VRMHumanBoneName)),
      S.Object({
        local: S.Mat4(),
        world: S.Mat4()
      }),
      {}
    ),
    /** The VRM model */
    vrm: S.Type<VRM>()
  }),

  reactor: function () {
    const entity = useEntityContext()
    const rigComponent = useComponent(entity, AvatarRigComponent)
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)
    const locomotionAnimationState = useHookstate(
      getMutableState(AnimationState).loadedAnimations[preloadedAnimations.locomotion]
    )

    useEffect(() => {
      if (gltfComponent?.progress?.value !== 100) return
      console.log('Creating VRM')
      const vrm = createVRM(entity)
      setupAvatarProportions(entity, vrm)
      rigComponent.vrm.set(vrm)
    }, [gltfComponent?.progress?.value, gltfComponent?.src.value])

    useEffect(() => {
      if (!rigComponent.value || !rigComponent.value.vrm) return
      const rig = getComponent(entity, AvatarRigComponent)
      try {
        setupAvatarForUser(entity, rig.vrm)
        setAvatarAnimations(entity)
      } catch (e) {
        console.error('Failed to load avatar', e)
        addError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
        return () => {
          removeError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
        }
      }
    }, [rigComponent.vrm])

    useEffect(() => {
      if (!locomotionAnimationState?.value) return
      setAvatarSpeedFromRootMotion()
    }, [locomotionAnimationState])

    return null
  },

  errors: ['UNSUPPORTED_AVATAR']
})

const _rightHandPos = new Vector3(),
  _rightUpperArmPos = new Vector3()

export default function createVRM(rootEntity: Entity) {
  const documentID = GLTFComponent.getInstanceID(rootEntity)
  const gltf = getState(GLTFDocumentState)[documentID]
  console.log(gltf)
  if (!hasComponent(rootEntity, Object3DComponent)) {
    const obj3d = new Group()
    setComponent(rootEntity, Object3DComponent, obj3d)
    addObjectToGroup(rootEntity, obj3d)
    proxifyParentChildRelationships(obj3d)
  }

  if (gltf.extensions?.VRM || gltf.extensions?.VRMC_vrm) {
    console.log('Creating VRM from VRM extension')
    const vrmExtensionDefinition = (gltf.extensions!.VRM as V0VRM.VRM) ?? (gltf.extensions.VRMC_vrm as V0VRM.VRM)
    const humanBonesArray = Array.isArray(vrmExtensionDefinition.humanoid?.humanBones)
      ? vrmExtensionDefinition.humanoid?.humanBones
      : Object.values(vrmExtensionDefinition.humanoid!.humanBones!)
    console.log(humanBonesArray)
    const bones = humanBonesArray.reduce((bones, bone) => {
      console.log(bone)
      const nodeID = `${documentID}-${bone.node}` as EntityUUID
      const entity = UUIDComponent.getEntityByUUID(nodeID)
      bones[bone.bone!] = { node: getComponent(entity, BoneComponent) }
      return bones
    }, {} as VRMHumanBones)
    console.log(bones)
    console.log(vrmExtensionDefinition)

    /**hacky, @todo test with vrm1 */
    iterateEntityNode(rootEntity, (entity) => {
      const bone = getOptionalComponent(entity, BoneComponent)
      bone?.matrixWorld.identity()
      bone?.quaternion.set(0, 0, 0, 1)
      if (entity !== bones.hips.node.parent!.entity) bone?.matrixWorld.makeRotationY(Math.PI)
    })
    bones.hips.node.rotateY(Math.PI)

    const humanoid = new VRMHumanoid(bones)

    const scene = getComponent(rootEntity, Object3DComponent)

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

    return vrm
  }

  return createVRMFromGLTF(rootEntity, gltf)
}

const createVRMFromGLTF = (rootEntity: Entity, gltf: GLTF.IGLTF) => {
  const hipsEntity = iterateEntityNode(
    rootEntity,
    (entity) => entity,
    (entity) => hipsRegex.test(getComponent(entity, NameComponent)),
    false,
    true
  )?.[0]

  const hipsName = getComponent(hipsEntity, NameComponent)

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
    // if (!getComponent(entity, BoneComponent)) return
    const boneComponent = getOptionalComponent(entity, BoneComponent) || getComponent(entity, TransformComponent)
    boneComponent?.matrixWorld.identity()
    if (entity === rootEntity) return

    const name = getComponent(entity, NameComponent)
    /**match the keys to create a humanoid bones object */
    let boneName = mixamoPrefix + name

    if (removeSuffix) boneName = boneName.slice(0, 9) + name.slice(10)

    //remove colon from the bone name
    if (boneName.includes(':')) boneName = boneName.replace(':', '')

    const bone = mixamoVRMRigMap[boneName] as string
    if (bone) {
      if (boneComponent instanceof Bone) boneComponent.quaternion.set(0, 0, 0, 1)
      const node = getComponent(entity, BoneComponent)
      bones[bone] = { node } as VRMHumanBone
    }
  })
  const humanoid = enforceTPose(bones)
  const scene = getComponent(rootEntity, Object3DComponent)
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

  if (!vrm.userData) vrm.userData = {}
  humanoid.humanBones.rightHand.node.getWorldPosition(_rightHandPos)
  humanoid.humanBones.rightUpperArm.node.getWorldPosition(_rightUpperArmPos)

  return vrm
}

const legAngle = new Euler(0, 0, Math.PI)
const rightShoulderAngle = new Euler(Math.PI / 2, 0, Math.PI / 2)
const leftShoulderAngle = new Euler(Math.PI / 2, 0, -Math.PI / 2)
const footAngle = new Euler(Math.PI / 3, 0, 0)
const toesAngle = new Euler(Math.PI / 6, 0, 0)
/**Rewrites avatar's bone quaternions and matrices to match a tpose */
export const enforceTPose = (bones: VRMHumanBones) => {
  bones.rightShoulder!.node.quaternion.setFromEuler(rightShoulderAngle)
  iterateEntityNode(bones.rightShoulder!.node.entity, (entity) => {
    getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(rightShoulderAngle)
  })
  bones.rightShoulder!.node.matrixWorld.makeRotationFromEuler(rightShoulderAngle)
  bones.rightUpperArm.node.quaternion.set(0, 0, 0, 1)
  bones.rightLowerArm.node.quaternion.set(0, 0, 0, 1)

  bones.leftShoulder!.node.quaternion.setFromEuler(leftShoulderAngle)
  iterateEntityNode(bones.leftShoulder!.node.entity, (entity) => {
    getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(leftShoulderAngle)
  })
  bones.leftUpperArm.node.quaternion.set(0, 0, 0, 1)
  bones.leftLowerArm.node.quaternion.set(0, 0, 0, 1)

  bones.rightUpperLeg.node.quaternion.setFromEuler(legAngle)
  iterateEntityNode(bones.rightUpperLeg!.node.entity, (entity) => {
    getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(legAngle)
  })
  bones.rightLowerLeg.node.quaternion.set(0, 0, 0, 1)

  bones.leftUpperLeg.node.quaternion.setFromEuler(legAngle)
  iterateEntityNode(bones.leftUpperLeg!.node.entity, (entity) => {
    getComponent(entity, BoneComponent).matrixWorld.makeRotationFromEuler(legAngle)
  })
  bones.leftLowerLeg.node.quaternion.set(0, 0, 0, 1)

  bones.rightFoot.node.quaternion.setFromEuler(footAngle)
  bones.rightToes?.node.quaternion.setFromEuler(toesAngle)

  bones.leftFoot.node.quaternion.setFromEuler(footAngle)
  bones.leftToes?.node.quaternion.setFromEuler(toesAngle)

  return new VRMHumanoid(bones)
}

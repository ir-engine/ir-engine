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
import { AnimationAction, Euler, Group, Matrix4, Vector3 } from 'three'

import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, getState, matches, useHookstate } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'

import { GLTF } from '@gltf-transform/core'
import { UUIDComponent } from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { Object3DComponent } from '@ir-engine/spatial/src/renderer/components/Object3DComponent'
import { EntityTreeComponent, iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { GLTFDocumentState } from '../../gltf/GLTFDocumentState'
import { addError, removeError } from '../../scene/functions/ErrorFunctions'
import { proxifyParentChildRelationships } from '../../scene/functions/loadGLTFModel'
import { AnimationState } from '../AnimationManager'
import { mixamoVRMRigMap } from '../AvatarBoneMatching'
import { preloadedAnimations } from '../animation/Util'
import {
  setAvatarAnimations,
  setAvatarSpeedFromRootMotion,
  setupAvatarForUser,
  setupAvatarProportions
} from '../functions/avatarFunctions'
import { VRMComponent } from './VRMComponent'

export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  onInit: (entity) => {
    return {
      animationGraph: {
        blendAnimation: undefined as undefined | AnimationAction,
        fadingOut: false,
        blendStrength: 0,
        layer: 0
      },
      /** ratio between original and target skeleton's root.position.y */
      rootYRatio: 1,
      /** The input vector for 2D locomotion blending space */
      locomotion: new Vector3(),
      /** Time since the last update */
      deltaAccumulator: 0,
      /** Tells us if we are suspended in midair */
      isGrounded: true
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.rootYRatio)) component.rootYRatio.set(json.rootYRatio)
    if (matches.object.test(json.locomotion)) component.locomotion.value.copy(json.locomotion)
    if (matches.number.test(json.deltaAccumulator)) component.deltaAccumulator.set(json.deltaAccumulator)
    if (matches.boolean.test(json.isGrounded)) component.isGrounded.set(json.isGrounded)
  }
})

export type Matrices = { local: Matrix4; world: Matrix4 }

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  onInit: (entity) => {
    return {
      /** rig bones with quaternions relative to the raw bones in their bind pose */
      normalizedRig: null! as VRMHumanBones,
      /** contains the raw bone quaternions */
      rawRig: null! as VRMHumanBones,
      /** contains ik solve data */
      ikMatrices: {} as Record<VRMHumanBoneName, Matrices>,
      /** The VRM model */
      vrm: null! as VRM,
      avatarURL: null as string | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.normalizedRig)) component.normalizedRig.set(json.normalizedRig)
    if (matches.object.test(json.rawRig)) component.rawRig.set(json.rawRig)
    if (matches.object.test(json.vrm)) component.vrm.set(json.vrm as VRM)
    if (matches.string.test(json.avatarURL)) component.avatarURL.set(json.avatarURL)
  },

  reactor: function () {
    const entity = useEntityContext()
    const rigComponent = useComponent(entity, AvatarRigComponent)
    const gltfComponent = useOptionalComponent(entity, GLTFComponent)
    const locomotionAnimationState = useHookstate(
      getMutableState(AnimationState).loadedAnimations[preloadedAnimations.locomotion]
    )

    /** @todo move asset loading to a new VRMComponent */
    useEffect(() => {
      if (!rigComponent?.avatarURL?.value) return
      setComponent(entity, GLTFComponent, { src: rigComponent.avatarURL.value })
      return () => {
        removeComponent(entity, GLTFComponent)
      }
    }, [rigComponent?.avatarURL?.value])

    useEffect(() => {
      if (gltfComponent?.progress?.value !== 100) return
      console.log('Creating VRM')
      const vrm = createVRM(entity)
      setupAvatarProportions(entity, vrm)
      rigComponent.vrm.set(vrm)
    }, [gltfComponent?.progress?.value])

    useEffect(() => {
      if (!rigComponent?.vrm?.value) return
      const rig = getComponent(entity, AvatarRigComponent)
      setComponent(entity, VRMComponent, rig.vrm)
      return () => {
        removeComponent(entity, VRMComponent)
      }
    }, [rigComponent?.vrm?.value])

    useEffect(() => {
      if (
        !rigComponent.value ||
        !rigComponent.value.vrm ||
        !rigComponent.value.avatarURL ||
        !locomotionAnimationState?.value
      )
        return
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
      if (entity !== bones.hips.node.parent!.entity) bone?.matrixWorld.makeRotationY(Math.PI)
    })
    bones.hips.node.rotateY(Math.PI)

    const humanoid = new VRMHumanoid(bones)

    const scene = getComponent(rootEntity, Object3DComponent) as any as Group

    const meta = vrmExtensionDefinition.meta! as any

    const vrm = new VRM({
      scene,
      humanoid,
      meta
      // expressionManager: gltf.userData.vrmExpressionManager,
      // firstPerson: gltf.userData.vrmFirstPerson,
      // lookAt: gltf.userData.vrmLookAt,
      // materials: gltf.userData.vrmMToonMaterials,
      // springBoneManager: gltf.userData.vrmSpringBoneManager,
      // nodeConstraintManager: gltf.userData.vrmNodeConstraintManager,
    })

    return vrm
  }

  return createVRMFromGLTF(rootEntity, gltf)
}

const hipsRegex = /hip|pelvis/i
export const recursiveHipsLookup = (entity: Entity): Entity | undefined => {
  const name = getComponent(entity, NameComponent).toLowerCase()
  if (hipsRegex.test(name)) {
    return entity
  }
  const children = getComponent(entity, EntityTreeComponent).children
  for (const child of children) {
    const e = recursiveHipsLookup(child)
    if (e) return e
  }
}

const createVRMFromGLTF = (rootEntity: Entity, gltf: GLTF.IGLTF) => {
  const hipsEntity = recursiveHipsLookup(rootEntity)!

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
      bones[bone] = { node: getComponent(entity, BoneComponent) } as VRMHumanBone
    }
  })
  const humanoid = enforceTPose(bones)
  const scene = getComponent(rootEntity, Object3DComponent)
  const children = getComponent(rootEntity, EntityTreeComponent).children
  const childName = getComponent(children[0], NameComponent)

  const vrm = new VRM({
    humanoid,
    scene: scene,
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

  return new VRMHumanoid(bones)
}

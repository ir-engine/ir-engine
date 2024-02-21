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

import { useEffect } from 'react'
import { MathUtils, Matrix4, Quaternion, Vector3 } from 'three'

import {
  NO_PROXY,
  defineState,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState
} from '@etherealengine/hyperflux'

import config from '@etherealengine/common/src/config'
import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import {
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { Entity } from '@etherealengine/ecs/src/Entity'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { UUIDComponent } from '@etherealengine/spatial/src/common/UUIDComponent'
import {
  createPriorityQueue,
  createSortAndApplyPriorityQueue
} from '@etherealengine/spatial/src/common/functions/PriorityQueue'
import { NetworkState } from '@etherealengine/spatial/src/networking/NetworkState'
import { RigidBodyComponent } from '@etherealengine/spatial/src/physics/components/RigidBodyComponent'
import { TransformSystem } from '@etherealengine/spatial/src/transform/TransformModule'
import { compareDistanceToCamera } from '@etherealengine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'
import { XRLeftHandComponent, XRRightHandComponent } from '@etherealengine/spatial/src/xr/XRComponents'
import { XRControlsState, XRState } from '@etherealengine/spatial/src/xr/XRState'
import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import { useBatchGLTF } from '../../assets/functions/resourceHooks'
import { AnimationComponent } from '.././components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '.././components/AvatarAnimationComponent'
import { AvatarHeadDecapComponent, AvatarIKTargetComponent } from '.././components/AvatarIKComponents'
import { AnimationState } from '../AnimationManager'
import { IKSerialization } from '../IKSerialization'
import { updateAnimationGraph } from '../animation/AvatarAnimationGraph'
import { solveTwoBoneIK } from '../animation/TwoBoneIKSolver'
import { ikTargets, preloadedAnimations } from '../animation/Util'
import { applyHandRotationFK } from '../animation/applyHandRotationFK'
import { getArmIKHint } from '../animation/getArmIKHint'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkinnedMeshComponent } from '../components/SkinnedMeshComponent'
import { retargetAnimationClip } from '../functions/retargetMixamoRig'
import { updateVRMRetargeting } from '../functions/updateVRMRetargeting'
import { LocalAvatarState } from '../state/AvatarState'
import { AnimationSystem } from './AnimationSystem'

export const AvatarAnimationState = defineState({
  name: 'AvatarAnimationState',
  initial: () => {
    const accumulationBudget = 100 //isMobileXRHeadset ? 2 : 6

    const priorityQueue = createPriorityQueue({
      accumulationBudget
    })

    return {
      priorityQueue,
      sortedTransformEntities: [] as Entity[],
      visualizers: [] as Entity[]
    }
  }
})

const avatarAnimationQuery = defineQuery([AnimationComponent, AvatarAnimationComponent, AvatarRigComponent])
const avatarComponentQuery = defineQuery([AvatarComponent])

const _quat = new Quaternion()
const _quat2 = new Quaternion()
const _vector3 = new Vector3()
const _hint = new Vector3()
const mat4 = new Matrix4()
const hipsForward = new Vector3(0, 0, 1)

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(avatarComponentQuery, compareDistanceToCamera)

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds } = getState(ECSState)

  /** Calculate avatar locomotion animations outside of priority queue */

  for (const entity of avatarComponentQuery()) {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
    if (rigidbodyComponent.body.isEnabled()) {
      // TODO: use x locomotion for side-stepping when full 2D blending spaces are implemented
      avatarAnimationComponent.locomotion.x = 0
      avatarAnimationComponent.locomotion.y = rigidbodyComponent.linearVelocity.y
      // lerp animated forward animation to smoothly animate to a stop
      avatarAnimationComponent.locomotion.z = MathUtils.lerp(
        avatarAnimationComponent.locomotion.z || 0,
        _vector3.copy(rigidbodyComponent.linearVelocity).setComponent(1, 0).length(),
        10 * deltaSeconds
      )
    } else {
      avatarAnimationComponent.locomotion.setScalar(0)
    }
  }

  /**
   * 1 - Sort & apply avatar priority queue
   */
  sortAndApplyPriorityQueue(priorityQueue, sortedTransformEntities, deltaSeconds)

  /**
   * 2 - Apply avatar animations
   */
  const avatarAnimationQueryArr = avatarAnimationQuery()
  const avatarAnimationEntities: Entity[] = []
  for (let i = 0; i < avatarAnimationQueryArr.length; i++) {
    const _entity = avatarAnimationQueryArr[i]
    if (priorityQueue.priorityEntities.has(_entity) || _entity === Engine.instance.localClientEntity) {
      avatarAnimationEntities.push(_entity)
    }
  }
  updateAnimationGraph(avatarAnimationEntities)

  for (const entity of avatarAnimationEntities) {
    const rigComponent = getComponent(entity, AvatarRigComponent)
    const avatarComponent = getComponent(entity, AvatarComponent)
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

    avatarAnimationComponent.deltaAccumulator = elapsedSeconds
    const rawRig = rigComponent.rawRig
    const normalizedRig = rigComponent.normalizedRig

    if (!rawRig?.hips?.node) continue

    const uuid = getComponent(entity, UUIDComponent)
    const leftFoot = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftFoot) as EntityUUID)
    const leftFootTransform = getOptionalComponent(leftFoot, TransformComponent)
    const leftFootTargetBlendWeight = AvatarIKTargetComponent.blendWeight[leftFoot]

    const rightFoot = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightFoot) as EntityUUID)
    const rightFootTransform = getOptionalComponent(rightFoot, TransformComponent)
    const rightFootTargetBlendWeight = AvatarIKTargetComponent.blendWeight[rightFoot]

    const leftHand = UUIDComponent.getEntityByUUID((uuid + ikTargets.leftHand) as EntityUUID)
    const leftHandTransform = getOptionalComponent(leftHand, TransformComponent)
    const leftHandTargetBlendWeight = AvatarIKTargetComponent.blendWeight[leftHand]

    const rightHand = UUIDComponent.getEntityByUUID((uuid + ikTargets.rightHand) as EntityUUID)
    const rightHandTransform = getOptionalComponent(rightHand, TransformComponent)
    const rightHandTargetBlendWeight = AvatarIKTargetComponent.blendWeight[rightHand]

    const head = UUIDComponent.getEntityByUUID((uuid + ikTargets.head) as EntityUUID)
    const headTargetBlendWeight = AvatarIKTargetComponent.blendWeight[head]

    const transform = getComponent(entity, TransformComponent)

    const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
    if (headTargetBlendWeight) {
      const headTransform = getComponent(head, TransformComponent)
      normalizedRig.hips.node.position.set(
        headTransform.position.x,
        headTransform.position.y - avatarComponent.torsoLength - 0.125,
        headTransform.position.z
      )

      //offset target forward to account for hips being behind the head
      hipsForward.set(0, 0, 1)
      hipsForward.applyQuaternion(rigidbodyComponent.rotation)
      hipsForward.multiplyScalar(0.125)
      normalizedRig.hips.node.position.sub(hipsForward)

      // convert to local space
      normalizedRig.hips.node.position.applyMatrix4(mat4.copy(transform.matrixWorld).invert())

      _quat2.copy(headTransform.rotation)

      //calculate head look direction and apply to head bone
      //look direction should be set outside of the xr switch
      normalizedRig.head.node.quaternion.multiplyQuaternions(
        normalizedRig.spine.node.getWorldQuaternion(_quat).invert(),
        _quat2
      )
    }

    if (rightHandTargetBlendWeight && rightHandTransform) {
      getArmIKHint(
        entity,
        rightHandTransform.position,
        rightHandTransform.rotation,
        rawRig.rightUpperArm.node.getWorldPosition(_vector3),
        'right',
        _hint
      )

      solveTwoBoneIK(
        VRMHumanBoneName.RightUpperArm,
        VRMHumanBoneName.RightLowerArm,
        VRMHumanBoneName.RightHand,
        rigComponent.vrm,
        rightHandTransform.position,
        rightHandTransform.rotation,
        null,
        _hint,
        rightHandTargetBlendWeight,
        rightHandTargetBlendWeight
      )
    }

    if (leftHandTargetBlendWeight && leftHandTransform) {
      getArmIKHint(
        entity,
        leftHandTransform.position,
        leftHandTransform.rotation,
        rawRig.leftUpperArm.node.getWorldPosition(_vector3),
        'left',
        _hint
      )
      solveTwoBoneIK(
        VRMHumanBoneName.LeftUpperArm,
        VRMHumanBoneName.LeftLowerArm,
        VRMHumanBoneName.LeftHand,
        rigComponent.vrm,
        leftHandTransform.position,
        leftHandTransform.rotation,
        null,
        _hint,
        leftHandTargetBlendWeight,
        leftHandTargetBlendWeight
      )
    }

    if (rightFootTargetBlendWeight && rightFootTransform) {
      _hint
        .set(-avatarComponent.footGap * 1.5, 0, 1)
        .applyQuaternion(transform.rotation)
        .add(transform.position)

      solveTwoBoneIK(
        VRMHumanBoneName.RightUpperLeg,
        VRMHumanBoneName.RightLowerLeg,
        VRMHumanBoneName.RightFoot,
        rigComponent.vrm,
        rightFootTransform.position,
        rightFootTransform.rotation,
        null,
        _hint,
        rightFootTargetBlendWeight,
        rightFootTargetBlendWeight
      )
    }

    if (leftFootTargetBlendWeight && leftFootTransform) {
      _hint
        .set(avatarComponent.footGap * 1.5, 0, 1)
        .applyQuaternion(transform.rotation)
        .add(transform.position)

      solveTwoBoneIK(
        VRMHumanBoneName.LeftUpperLeg,
        VRMHumanBoneName.LeftLowerLeg,
        VRMHumanBoneName.LeftFoot,
        rigComponent.vrm,
        leftFootTransform.position,
        leftFootTransform.rotation,
        null,
        _hint,
        leftFootTargetBlendWeight,
        leftFootTargetBlendWeight
      )
    }

    if (hasComponent(entity, XRRightHandComponent)) {
      applyHandRotationFK(rigComponent.vrm, 'right', getComponent(entity, XRRightHandComponent).rotations)
    }

    if (hasComponent(entity, XRLeftHandComponent)) {
      applyHandRotationFK(rigComponent.vrm, 'left', getComponent(entity, XRLeftHandComponent).rotations)
    }

    updateVRMRetargeting(rigComponent.vrm, entity)

    /** temporary hack for normalized bones to work with ik solves */
    if (headTargetBlendWeight)
      for (const boneName of VRMHumanBoneList) {
        if (normalizedRig[boneName]) {
          if (boneName == 'hips') normalizedRig[boneName]!.node.matrixWorld.copy(transform.matrixWorld)
          else normalizedRig[boneName]!.node.updateMatrixWorld()
        }
      }
  }
}

const reactor = () => {
  /**loads animation bundles. assumes the bundle is a glb */
  const animations = [preloadedAnimations.locomotion, preloadedAnimations.emotes]
  const [gltfs, unload] = useBatchGLTF(
    animations.map((animationFile) => {
      return `${config.client.fileServer}/projects/default-project/assets/animations/${animationFile}.glb`
    })
  )
  const manager = useMutableState(AnimationState)

  useEffect(() => {
    return unload
  }, [])

  useEffect(() => {
    const assets = gltfs.get(NO_PROXY)
    if (assets.length !== animations.length) return
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      if (asset && !manager.loadedAnimations[animations[i]].value) {
        // delete unneeded geometry data to save memory
        asset.scene.traverse((node) => {
          delete (node as any).geometry
          delete (node as any).material
        })
        for (let i = 0; i < asset.animations.length; i++) {
          retargetAnimationClip(asset.animations[i], asset.scene)
        }
        //ensure animations are always placed in the scene
        asset.scene.animations = asset.animations
        manager.loadedAnimations[animations[i]].set(asset)
      }
    }
  }, [gltfs])

  useEffect(() => {
    const networkState = getMutableState(NetworkState)

    networkState.networkSchema[IKSerialization.ID].set({
      read: IKSerialization.readBlendWeight,
      write: IKSerialization.writeBlendWeight
    })

    return () => {
      networkState.networkSchema[IKSerialization.ID].set(none)
    }
  }, [])

  const xrState = getMutableState(XRState)
  const session = useHookstate(xrState.session)
  const isCameraAttachedToAvatar = useHookstate(getMutableState(XRControlsState).isCameraAttachedToAvatar)
  const userReady = useHookstate(getMutableState(LocalAvatarState).avatarReady)

  useEffect(() => {
    if (!session.value) return

    const entity = Engine.instance.localClientEntity
    if (!entity) return

    if (isCameraAttachedToAvatar.value) {
      setComponent(entity, AvatarHeadDecapComponent, true)
    } else {
      removeComponent(entity, AvatarHeadDecapComponent)
    }
  }, [isCameraAttachedToAvatar, session])

  useEffect(() => {
    if (!Engine.instance.localClientEntity) {
      XRState.setTrackingSpace()
      return
    }
    const eyeHeight = getComponent(Engine.instance.localClientEntity, AvatarComponent).eyeHeight
    getMutableState(XRState).userEyeHeight.set(eyeHeight)
    XRState.setTrackingSpace()
  }, [userReady])

  return null
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  insert: { after: AnimationSystem },
  execute,
  reactor
})

const skinnedMeshQuery = defineQuery([SkinnedMeshComponent])

const updateSkinnedMeshes = () => {
  for (const entity of skinnedMeshQuery()) {
    const skinnedMesh = getComponent(entity, SkinnedMeshComponent)
    if (skinnedMesh.bindMode === 'attached') {
      skinnedMesh.bindMatrixInverse.copy(skinnedMesh.matrixWorld).invert()
    } else if (skinnedMesh.bindMode === 'detached') {
      skinnedMesh.bindMatrixInverse.copy(skinnedMesh.bindMatrix).invert()
    } else {
      console.warn('THREE.SkinnedMesh: Unrecognized bindMode: ' + skinnedMesh.bindMode)
    }
  }
}

export const SkinnedMeshTransformSystem = defineSystem({
  uuid: 'ee.engine.SkinnedMeshTransformSystem',
  insert: { after: TransformSystem },
  execute: updateSkinnedMeshes
})

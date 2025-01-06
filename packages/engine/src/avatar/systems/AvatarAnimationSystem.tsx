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

import { useEffect } from 'react'
import { AnimationClip, AnimationMixer, Group, MathUtils, Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  setComponent,
  useOptionalComponent,
  useQuery
} from '@ir-engine/ecs'
import { defineState, getMutableState, getState, isClient, useMutableState } from '@ir-engine/hyperflux'
import {
  createPriorityQueue,
  createSortAndApplyPriorityQueue
} from '@ir-engine/spatial/src/common/functions/PriorityQueue'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { compareDistanceToCamera } from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformSystem } from '@ir-engine/spatial/src/transform/TransformModule'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { traverseEntityNode } from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import React from 'react'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { addError, removeError } from '../../scene/functions/ErrorFunctions'
import { getRootSpeed, updateAnimationGraph } from '../animation/AvatarAnimationGraph'
import { preloadedAnimations } from '../animation/Util'
import { AnimationState } from '../AnimationManager'
import { mixamoVRMRigMap } from '../AvatarBoneMatching'
import { AnimationComponent, useLoadAnimationFromBatchGLTF } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent, createVRM } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { getAllLoadedAnimations, setupAvatarProportions } from '../functions/avatarFunctions'
import { normalizeAnimationClips, retargetAnimationClips } from '../functions/retargetingFunctions'
import { updateVRMRetargeting } from '../functions/updateVRMRetargeting'
import { AvatarMovementSettingsState } from '../state/AvatarMovementSettingsState'
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
const avatarComponentQuery = defineQuery([AvatarComponent, RigidBodyComponent, AvatarAnimationComponent])
const avatarRigQuery = defineQuery([AvatarRigComponent])

const _vector3 = new Vector3()

const sortAndApplyPriorityQueue = createSortAndApplyPriorityQueue(avatarComponentQuery, compareDistanceToCamera)

const execute = () => {
  const { priorityQueue, sortedTransformEntities, visualizers } = getState(AvatarAnimationState)
  const { elapsedSeconds, deltaSeconds } = getState(ECSState)

  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()

  /** Calculate avatar locomotion animations outside of priority queue */

  for (const entity of avatarComponentQuery()) {
    const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)
    const rigidbodyComponent = getComponent(entity, RigidBodyComponent)
    // TODO: use x locomotion for side-stepping when full 2D blending spaces are implemented
    avatarAnimationComponent.locomotion.x = 0
    avatarAnimationComponent.locomotion.y = rigidbodyComponent.linearVelocity.y
    // lerp animated forward animation to smoothly animate to a stop
    avatarAnimationComponent.locomotion.z = MathUtils.lerp(
      avatarAnimationComponent.locomotion.z || 0,
      _vector3.copy(rigidbodyComponent.linearVelocity).setComponent(1, 0).length(),
      10 * deltaSeconds
    )
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
    if (priorityQueue.priorityEntities.has(_entity) || _entity === selfAvatarEntity) {
      avatarAnimationEntities.push(_entity)
    }
  }

  updateAnimationGraph(avatarAnimationEntities)

  for (const entity of avatarRigQuery()) updateVRMRetargeting(entity)
}

const Reactor = () => {
  const selfAvatarEntity = AvatarComponent.useSelfAvatarEntity()
  const selfAvatarLoaded = useOptionalComponent(selfAvatarEntity, GLTFComponent)?.progress?.value === 100

  useEffect(() => {
    if (!selfAvatarLoaded) {
      XRState.setTrackingSpace()
      return
    }
    const eyeHeight = getComponent(selfAvatarEntity, AvatarComponent).eyeHeight
    getMutableState(XRState).userEyeHeight.set(eyeHeight)
    XRState.setTrackingSpace()
  }, [selfAvatarLoaded])

  return null
}

/**
 * @todo replace this with a retargeting utility to retarget the source animation assets rather than every time on load,
 * and introduce a loader function that only loads the necessary data to avoid cleanup of the ecs armature
 */
export const setupMixamoAnimation = (entity: Entity) => {
  normalizeAnimationClips(entity)
  setComponent(entity, AvatarRigComponent)
  traverseEntityNode(entity, (child) => {
    const name = getComponent(child, NameComponent).replace(':', '')
    if (mixamoVRMRigMap[name]) AvatarRigComponent.setBone(entity, child, mixamoVRMRigMap[name])
  })
  retargetAnimationClips(entity)
}

const runClipName = 'Run_RootMotion',
  walkClipName = 'Walk_RootMotion'
const AnimationLoader = () => {
  const animations = [preloadedAnimations.locomotion, preloadedAnimations.emotes]

  const loadedAnimations = useLoadAnimationFromBatchGLTF(
    animations.map((animationFile) => {
      return `${
        getState(DomainConfigState).cloudDomain
      }/projects/ir-engine/default-project/assets/animations/${animationFile}.glb`
    }),
    true
  )

  useEffect(() => {
    if (!loadedAnimations.value) return

    let i = 0
    for (const [clips, entity] of loadedAnimations.value as [AnimationClip[] | null, Entity][]) {
      if (getState(AnimationState).loadedAnimations[animations[i]]) continue

      setupMixamoAnimation(entity)

      /** @todo handle avatar animation clips generically */
      const run = AnimationClip.findByName(clips ?? [], runClipName)
      const walk = AnimationClip.findByName(clips ?? [], walkClipName)

      const movement = getMutableState(AvatarMovementSettingsState)
      if (run) movement.runSpeed.set(getRootSpeed(run))
      if (walk) movement.walkSpeed.set(getRootSpeed(walk))

      getMutableState(AnimationState).loadedAnimations[animations[i]].set(entity!)
      i++
    }
  }, [loadedAnimations.value])

  return null
}

const RigReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const gltfComponent = useOptionalComponent(entity, GLTFComponent)
  const avatarAnimationComponent = useOptionalComponent(entity, AvatarAnimationComponent)
  useEffect(() => {
    if (gltfComponent?.progress?.value !== 100 || !avatarAnimationComponent?.value) return
    try {
      createVRM(entity)
      setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Avatar)
      setupAvatarProportions(entity)
    } catch (e) {
      console.error('Failed to load avatar', e)
      addError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
      return () => {
        removeError(entity, AvatarRigComponent, 'UNSUPPORTED_AVATAR')
      }
    }
  }, [gltfComponent?.progress?.value, gltfComponent?.src.value, avatarAnimationComponent])

  return null
}

const AnimationReactor = (props: { entity: Entity }) => {
  const entity = props.entity
  const rigComponent = useOptionalComponent(entity, AvatarRigComponent)
  const loadedAnimations = useMutableState(AnimationState).loadedAnimations
  useEffect(() => {
    if (!rigComponent?.vrm?.scene?.value) return
    setComponent(entity, AnimationComponent, {
      animations: getAllLoadedAnimations(),
      mixer: new AnimationMixer(rigComponent.vrm.scene.value as Group)
    })
  }, [rigComponent?.vrm, loadedAnimations])
  return null
}

export const AvatarAnimationSystemReactor = () => {
  const rigEntities = useQuery([AvatarRigComponent])
  const avatarAnimationEntities = useQuery([AvatarAnimationComponent, AvatarComponent, AvatarRigComponent])
  return (
    <>
      <Reactor />
      {rigEntities.length > 0 && <AnimationLoader />}
      <>
        {rigEntities.map((entity: Entity) => (
          <RigReactor entity={entity} key={entity} />
        ))}
        {avatarAnimationEntities.map((entity: Entity) => (
          <AnimationReactor entity={entity} key={entity} />
        ))}
      </>
    </>
  )
}

export const AvatarAnimationSystem = defineSystem({
  uuid: 'ee.engine.AvatarAnimationSystem',
  insert: { after: AnimationSystem },
  execute,
  reactor: () => {
    if (!isClient) return null
    return AvatarAnimationSystemReactor()
  }
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

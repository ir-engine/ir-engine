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

import { VRM, VRMHumanBoneList, VRMHumanBoneName, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import {
  AnimationAction,
  Bone,
  Euler,
  KeyframeTrack,
  Matrix4,
  Quaternion,
  SkeletonHelper,
  SkinnedMesh,
  Vector3
} from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent, setVisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { setComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { PoseSchema, TransformComponent } from '../../transform/components/TransformComponent'
import { AnimationState } from '../AnimationManager'
import { retargetAvatarAnimations, setupAvatarForUser } from '../functions/avatarFunctions'
import { AvatarComponent } from './AvatarComponent'
import { AvatarPendingComponent } from './AvatarPendingComponent'

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

export const AvatarRigComponent = defineComponent({
  name: 'AvatarRigComponent',

  schema: {
    rig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, PoseSchema]))
  },

  onInit: (entity) => {
    return {
      /** Holds all the proxified bones */
      rig: null! as VRMHumanBones,
      /** local space rig used for forward kinematic animation blending into the rig */
      localRig: null! as VRMHumanBones,
      /** the target */
      targetBones: null! as Record<VRMHumanBoneName, Bone>,

      helperEntity: null as Entity | null,
      /** The length of the torso in a t-pose, from the hip joint to the head joint */
      torsoLength: 0,
      /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
      upperLegLength: 0,
      /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
      lowerLegLength: 0,
      /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
      footHeight: 0,

      armLength: 0,

      footGap: 0,

      /** Cache of the skinned meshes currently on the rig */
      skinnedMeshes: [] as SkinnedMesh[],
      /** The VRM model */
      vrm: null! as VRM
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.rig)) component.rig.set(json.rig)
    if (matches.object.test(json.localRig)) component.localRig.set(json.localRig)
    if (matches.object.test(json.targetBones)) component.targetBones.set(json.targetBones)
    if (matches.number.test(json.torsoLength)) component.torsoLength.set(json.torsoLength)
    if (matches.number.test(json.upperLegLength)) component.upperLegLength.set(json.upperLegLength)
    if (matches.number.test(json.lowerLegLength)) component.lowerLegLength.set(json.lowerLegLength)
    if (matches.number.test(json.footHeight)) component.footHeight.set(json.footHeight)
    if (matches.number.test(json.footGap)) component.footGap.set(json.footGap)
    if (matches.array.test(json.skinnedMeshes)) component.skinnedMeshes.set(json.skinnedMeshes as SkinnedMesh[])
    if (matches.object.test(json.vrm)) component.vrm.set(json.vrm as VRM)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)
    const rigComponent = useComponent(entity, AvatarRigComponent)
    const pending = useOptionalComponent(entity, AvatarPendingComponent)
    const visible = useOptionalComponent(entity, VisibleComponent)

    useEffect(() => {
      if (!visible?.value || !debugEnabled.value || pending?.value || !rigComponent.value.rig?.hips?.node) return

      const helper = new SkeletonHelper(rigComponent.value.vrm.scene)
      helper.frustumCulled = false
      helper.name = `target-rig-helper-${entity}`
      setObjectLayers(helper, ObjectLayers.AvatarHelper)

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, helper)
      rigComponent.helperEntity.set(helperEntity)
      setComponent(helperEntity, NameComponent, helper.name)

      setComputedTransformComponent(helperEntity, entity, () => {
        const helperTransform = getComponent(helperEntity, TransformComponent)
        const avatarTransform = getComponent(entity, TransformComponent)
        helperTransform.position.copy(avatarTransform.position)
        helperTransform.rotation.copy(avatarTransform.rotation)

        // this updates the bone helper lines
        helper.updateMatrixWorld(true)
      })

      return () => {
        removeEntity(helperEntity)
        rigComponent.helperEntity.set(none)
      }
    }, [visible, debugEnabled, pending, rigComponent.rig])

    useEffect(() => {
      if (!rigComponent.value || !rigComponent.value.vrm) return
      setupAvatarForUser(entity, rigComponent.value.vrm)
      if (entity === Engine.instance.localClientEntity) getMutableState(EngineState).userReady.set(true)
    }, [rigComponent.vrm])

    /**
     * Proxify the rig bones with the bitecs store
     */
    useEffect(() => {
      const rig = rigComponent.rig.value
      if (!rig) return
      for (const [boneName, bone] of Object.entries(rig)) {
        if (!bone) continue
        proxifyVector3(AvatarRigComponent.rig[boneName].position, entity, bone.node.position)
        proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity, bone.node.quaternion)
      }
    }, [rigComponent.rig])

    const manager = useHookstate(getMutableState(AnimationState))

    useEffect(() => {
      if (!manager.loadedAnimations.value) return
      retargetAvatarAnimations(entity)
    }, [manager.loadedAnimations, rigComponent.rig])

    return null
  }
})

/**Used to generate an offset map that retargets ik position animations to fit any rig */
export const retargetIkUtility = (entity: Entity, bindTracks: KeyframeTrack[], height: number, flipped: boolean) => {
  const offset = new Vector3()
  const foot = new Vector3()

  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig.rig.hips?.node) return

  const avatarComponent = getComponent(entity, AvatarComponent)
  const scaleMultiplier = height / avatarComponent.avatarHeight

  offset.y = rig.localRig.rightFoot.node.getWorldPosition(foot).y * 2 * scaleMultiplier - 0.05

  const direction = flipped ? -1 : 1

  const hipsRotationoffset = new Quaternion().setFromEuler(new Euler(0, flipped ? Math.PI : 0, 0))

  const ikOffsetsMap = new Map<string, Vector3>()

  for (let i = 0; i < bindTracks.length; i += 3) {
    const key = bindTracks[i].name.substring(0, bindTracks[i].name.indexOf('.'))

    //todo: find a better way to map joints to ik targets here
    //currently hints are offset by joint forward to estimate where they should be for every rig
    const bonePos = new Matrix4()
    switch (key) {
      case 'rightHandTarget':
      case 'leftHandTarget':
      case 'rightFootTarget':
      case 'leftFootTarget':
      case 'headTarget':
        bonePos.copy(
          rig.localRig[key.replace('Target', '')].node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.localRig[key].node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'rightElbowHint':
        bonePos.copy(
          rig.localRig.rightLowerArm.node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.localRig.rightLowerArm.node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'leftElbowHint':
        bonePos.copy(
          rig.localRig.leftLowerArm.node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.localRig.leftLowerArm.node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'rightKneeHint':
        bonePos.copy(
          rig.localRig.rightLowerLeg.node.matrixWorld.multiply(
            new Matrix4().setPosition(
              rig.localRig.rightLowerLeg.node.getWorldDirection(new Vector3()).multiplyScalar(direction)
            )
          )
        )
        break
      case 'leftKneeHint':
        bonePos.copy(
          rig.localRig.leftLowerLeg.node.matrixWorld.multiply(
            new Matrix4().setPosition(
              rig.localRig.rightLowerLeg.node.getWorldDirection(new Vector3()).multiplyScalar(direction)
            )
          )
        )
        break
      case 'headHint':
        bonePos.copy(rig.localRig.head.node.matrixWorld)
      case 'hipsTarget':
        bonePos.copy(rig.localRig.hips.node.matrixWorld)
    }
    const pos = new Vector3()
    bonePos.decompose(pos, new Quaternion(), new Vector3())
    pos.applyQuaternion(hipsRotationoffset)
    pos.sub(
      new Vector3(bindTracks[i].values[0], bindTracks[i].values[1], bindTracks[i].values[2]).multiplyScalar(
        scaleMultiplier
      )
    )
    pos.sub(offset)
    ikOffsetsMap.set(key, pos)
  }
  return ikOffsetsMap
}

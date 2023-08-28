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

import { VRM, VRMHumanBoneList, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AnimationAction, Euler, KeyframeTrack, Matrix4, Quaternion, SkeletonHelper, SkinnedMesh, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup, removeObjectFromGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { PoseSchema } from '../../transform/components/TransformComponent'
import { AvatarComponent } from './AvatarComponent'
import { AvatarPendingComponent } from './AvatarPendingComponent'

export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  onInit: (entity) => {
    return {
      animationGraph: {
        blendAnimation: undefined as undefined | AnimationAction,
        needsSkip: false,
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
      /** Holds all the bones */
      rig: null! as VRMHumanBones,
      /** Read-only bones in bind pose */
      bindRig: null! as VRMHumanBones,
      helper: null as SkeletonHelper | null,
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

      flipped: false,

      /** Cache of the skinned meshes currently on the rig */
      skinnedMeshes: [] as SkinnedMesh[],
      /** The VRM model */
      vrm: null! as VRM,

      rootOffset: new Vector3(),
      ikOverride: '' as 'xr' | 'mocap' | ''
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.object.test(json.rig)) component.rig.set(json.rig as VRMHumanBones)
    if (matches.object.test(json.bindRig)) component.bindRig.set(json.bindRig as VRMHumanBones)
    if (matches.number.test(json.torsoLength)) component.torsoLength.set(json.torsoLength)
    if (matches.number.test(json.upperLegLength)) component.upperLegLength.set(json.upperLegLength)
    if (matches.number.test(json.lowerLegLength)) component.lowerLegLength.set(json.lowerLegLength)
    if (matches.number.test(json.footHeight)) component.footHeight.set(json.footHeight)
    if (matches.number.test(json.footGap)) component.footGap.set(json.footGap)
    if (matches.array.test(json.skinnedMeshes)) component.skinnedMeshes.set(json.skinnedMeshes as SkinnedMesh[])
    if (matches.object.test(json.vrm)) component.vrm.set(json.vrm as VRM)
    if (matches.string.test(json.ikOverride)) component.ikOverride.set(json.ikOverride)
  },

  onRemove: (entity, component) => {
    if (component.helper.value) {
      removeObjectFromGroup(entity, component.helper.value)
    }
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).debugEnable)
    const anim = useComponent(entity, AvatarRigComponent)
    const pending = useOptionalComponent(entity, AvatarPendingComponent)
    const rigComponent = getMutableComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (debugEnabled.value && !anim.helper.value && !pending?.value && anim.value.rig?.hips?.node) {
        const helper = new SkeletonHelper(anim.value.rig.hips.node.parent!)
        helper.frustumCulled = false
        helper.name = `skeleton-helper-${entity}`
        setObjectLayers(helper, ObjectLayers.PhysicsHelper)
        addObjectToGroup(entity, helper)
        anim.helper.set(helper)
      }

      if ((!debugEnabled.value || pending?.value) && anim.helper.value) {
        removeObjectFromGroup(entity, anim.helper.value)
        anim.helper.set(none)
      }
    }, [debugEnabled, pending])

    useEffect(() => {
      if (!rigComponent.value || !rigComponent.value.vrm) return
      const userData = (rigComponent.value.vrm as any).userData
      if (userData) rigComponent.flipped.set(userData && userData.flipped)
    }, [rigComponent.vrm])
    /**
     * Proxify the rig bones with the bitecs store
     */
    useEffect(() => {
      const rig = anim.rig.value
      if (!rig) return
      for (const [boneName, bone] of Object.entries(rig)) {
        if (!bone) continue
        // const axesHelper = new AxesHelper(0.1)
        // setObjectLayers(axesHelper, ObjectLayers.Scene)
        // bone.add(axesHelper)
        proxifyVector3(AvatarRigComponent.rig[boneName].position, entity, bone.node.position)
        proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity, bone.node.quaternion)
      }
    }, [anim.rig])

    return null
  }
})

/**Used to generate an offset map that retargets ik position animations to fit any rig */
export const retargetIkUtility = (entity: Entity, bindTracks: KeyframeTrack[], height: number) => {
  const offset = new Vector3()
  const foot = new Vector3()

  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig.rig.hips?.node) return

  const avatarComponent = getComponent(entity, AvatarComponent)
  const scaleMultiplier = height / avatarComponent.avatarHeight

  offset.y = rig.bindRig.rightFoot.node.getWorldPosition(foot).y * 2 * scaleMultiplier - 0.05

  const direction = rig.flipped ? -1 : 1

  const hipsRotationoffset = new Quaternion().setFromEuler(new Euler(0, rig.flipped ? Math.PI : 0, 0))

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
          rig.bindRig[key.replace('Target', '')].node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.bindRig[key].node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'rightElbowHint':
        bonePos.copy(
          rig.bindRig.rightLowerArm.node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.bindRig.rightLowerArm.node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'leftElbowHint':
        bonePos.copy(
          rig.bindRig.leftLowerArm.node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.bindRig.leftLowerArm.node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'rightKneeHint':
        bonePos.copy(
          rig.bindRig.rightLowerLeg.node.matrixWorld.multiply(
            new Matrix4().setPosition(
              rig.bindRig.rightLowerLeg.node.getWorldDirection(new Vector3()).multiplyScalar(direction)
            )
          )
        )
        break
      case 'leftKneeHint':
        bonePos.copy(
          rig.bindRig.leftLowerLeg.node.matrixWorld.multiply(
            new Matrix4().setPosition(
              rig.bindRig.rightLowerLeg.node.getWorldDirection(new Vector3()).multiplyScalar(direction)
            )
          )
        )
        break
      case 'headHint':
        bonePos.copy(rig.bindRig.head.node.matrixWorld)
      case 'hipsTarget':
        bonePos.copy(rig.bindRig.hips.node.matrixWorld)
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

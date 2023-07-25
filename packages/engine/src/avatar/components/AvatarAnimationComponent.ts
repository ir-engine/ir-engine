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
import { AnimationClip, Euler, Matrix4, Object3D, Quaternion, SkeletonHelper, SkinnedMesh, Vector3 } from 'three'

import { getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { proxifyQuaternion, proxifyVector3 } from '../../common/proxies/createThreejsProxy'
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
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from './AnimationComponent'
import { AvatarPendingComponent } from './AvatarPendingComponent'

export const AvatarAnimationComponent = defineComponent({
  name: 'AvatarAnimationComponent',

  onInit: (entity) => {
    return {
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

export interface ikTargets {
  rightHandTarget: Object3D
  leftHandTarget: Object3D
  rightFootTarget: Object3D
  leftFootTarget: Object3D
  headTarget: Object3D
  hipsTarget: Object3D

  rightElbowHint: Object3D
  leftElbowHint: Object3D
  rightKneeHint: Object3D
  leftKneeHint: Object3D
  headHint: Object3D
}

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

      /** Cache of the skinned meshes currently on the rig */
      skinnedMeshes: [] as SkinnedMesh[],
      /** The VRM model */
      vrm: null! as VRM,

      targets: new Object3D(),
      ikTargetsMap: {
        rightHandTarget: new Object3D(),
        leftHandTarget: new Object3D(),
        rightFootTarget: new Object3D(),
        leftFootTarget: new Object3D(),
        headTarget: new Object3D(),
        hipsTarget: new Object3D(),

        rightElbowHint: new Object3D(),
        leftElbowHint: new Object3D(),
        rightKneeHint: new Object3D(),
        leftKneeHint: new Object3D(),
        headHint: new Object3D()
      } as ikTargets,

      ikOffsetsMap: new Map<string, Vector3>(),
      rootOffset: new Vector3()
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
    if (matches.array.test(json.skinnedMeshes)) component.skinnedMeshes.set(json.skinnedMeshes as SkinnedMesh[])
    if (matches.object.test(json.vrm)) component.vrm.set(json.vrm as VRM)
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
      if (debugEnabled.value && !anim.helper.value && !pending?.value) {
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
    /**
     * Proxify the rig bones with the bitecs store
     */
    useEffect(() => {
      const rig = anim.rig.value
      for (const [boneName, bone] of Object.entries(rig)) {
        if (!bone) continue
        // const axesHelper = new AxesHelper(0.1)
        // setObjectLayers(axesHelper, ObjectLayers.Scene)
        // bone.add(axesHelper)
        proxifyVector3(AvatarRigComponent.rig[boneName].position, entity, bone.node.position)
        proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity, bone.node.quaternion)
      }
    }, [anim.rig])

    const animComponent = useComponent(entity, AnimationComponent)

    const offset = new Vector3()
    const foot = new Vector3()
    //Calculate ik target offsets for retargeting
    useEffect(() => {
      if (!animComponent.animations.value.length || !rigComponent.targets.children.length) return
      const bindTracks = AnimationClip.findByName(getState(AnimationManager).targetsAnimation!, 'BindPose').tracks
      if (!bindTracks) return

      const avatarComponent = getComponent(entity, AvatarComponent)
      const scaleMultiplier = avatarComponent.scaleMultiplier
      console.log(scaleMultiplier)

      offset.y = rigComponent.bindRig.rightFoot.node.value.getWorldPosition(foot).y * scaleMultiplier

      for (let i = 0; i < bindTracks.length; i += 3) {
        const key = bindTracks[i].name.substring(0, bindTracks[i].name.indexOf('.'))
        const hipsRotationoffset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

        //todo: find a better way to map joints to ik targets here
        //currently hints are offset by joint forward to estimate where they should be for every rig
        const bonePos = new Matrix4()
        switch (key) {
          case 'rightHandTarget':
            bonePos.copy(rigComponent.bindRig.rightHand.value.node.matrixWorld)
            break
          case 'leftHandTarget':
            bonePos.copy(rigComponent.bindRig.leftHand.value.node.matrixWorld)
            break
          case 'rightFootTarget':
            bonePos.copy(rigComponent.bindRig.rightFoot.value.node.matrixWorld)
            break
          case 'leftFootTarget':
            bonePos.copy(rigComponent.bindRig.leftFoot.value.node.matrixWorld)
            break
          case 'rightElbowHint':
            bonePos.copy(
              rigComponent.bindRig.rightLowerArm.value.node.matrixWorld.multiply(
                new Matrix4().setPosition(
                  rigComponent.bindRig.rightLowerArm.node.value.getWorldDirection(new Vector3())
                )
              )
            )
            break
          case 'leftElbowHint':
            bonePos.copy(
              rigComponent.bindRig.leftLowerArm.value.node.matrixWorld.multiply(
                new Matrix4().setPosition(rigComponent.bindRig.leftLowerArm.node.value.getWorldDirection(new Vector3()))
              )
            )
            break
          case 'rightKneeHint':
            bonePos.copy(
              rigComponent.bindRig.rightLowerLeg.value.node.matrixWorld.multiply(
                new Matrix4().setPosition(
                  rigComponent.bindRig.rightLowerLeg.node.value.getWorldDirection(new Vector3()).multiplyScalar(-1)
                )
              )
            )
            break
          case 'leftKneeHint':
            bonePos.copy(
              rigComponent.bindRig.leftLowerLeg.value.node.matrixWorld.multiply(
                new Matrix4().setPosition(
                  rigComponent.bindRig.rightLowerLeg.node.value.getWorldDirection(new Vector3()).multiplyScalar(-1)
                )
              )
            )
            break
          case 'headHint':
          case 'headTarget':
            bonePos.copy(rigComponent.bindRig.head.value.node.matrixWorld)
          case 'hipsTarget':
            bonePos.copy(rigComponent.bindRig.hips.value.node.matrixWorld)
        }
        const pos = new Vector3()
        bonePos.decompose(pos, new Quaternion(), new Vector3())
        if (!(rigComponent.vrm.value as any).userData) pos.applyQuaternion(hipsRotationoffset)
        pos.sub(
          new Vector3(bindTracks[i].values[0], bindTracks[i].values[1], bindTracks[i].values[2]).multiplyScalar(
            scaleMultiplier
          )
        )
        pos.sub(offset)
        rigComponent.ikOffsetsMap.value.set(key, pos)
      }
    }, [animComponent.animations, rigComponent.targets])
    return null
  }
})

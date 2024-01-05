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

import { VRM, VRMHumanBones } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { AnimationAction, Euler, KeyframeTrack, Matrix4, Quaternion, SkeletonHelper, Vector3 } from 'three'

import { getMutableState, none, useHookstate } from '@etherealengine/hyperflux'

import { matches } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, entityExists, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { RendererState } from '../../renderer/RendererState'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent, setVisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '../../transform/components/ComputedTransformComponent'
import { AnimationState } from '../AnimationManager'
import { locomotionAnimation } from '../animation/Util'
import { retargetAvatarAnimations, setupAvatarForUser } from '../functions/avatarFunctions'
import { AvatarState } from '../state/AvatarNetworkState'
import { AnimationComponent } from './AnimationComponent'
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

  onInit: (entity) => {
    return {
      /** Holds all the bones */
      normalizedRig: null! as VRMHumanBones,
      rawRig: null! as VRMHumanBones,

      helperEntity: null as Entity | null,

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

  onRemove: (entity, component) => {
    // ensure synchronously removed
    if (component.helperEntity.value) removeComponent(component.helperEntity.value, ComputedTransformComponent)
  },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)
    const rigComponent = useComponent(entity, AvatarRigComponent)
    const pending = useOptionalComponent(entity, AvatarPendingComponent)
    const visible = useOptionalComponent(entity, VisibleComponent)
    const modelComponent = useOptionalComponent(entity, ModelComponent)
    const locomotionAnimationState = useHookstate(getMutableState(AnimationState).loadedAnimations[locomotionAnimation])

    useEffect(() => {
      if (!visible?.value || !debugEnabled.value || pending?.value || !rigComponent.value.normalizedRig?.hips?.node)
        return

      const helper = new SkeletonHelper(rigComponent.value.vrm.scene)
      helper.frustumCulled = false
      helper.name = `target-rig-helper-${entity}`

      const helperEntity = createEntity()
      setVisibleComponent(helperEntity, true)
      addObjectToGroup(helperEntity, helper)
      rigComponent.helperEntity.set(helperEntity)
      setComponent(helperEntity, NameComponent, helper.name)
      setObjectLayers(helper, ObjectLayers.AvatarHelper)

      setComputedTransformComponent(helperEntity, entity, () => {
        // this updates the bone helper lines
        helper.updateMatrixWorld(true)
      })

      return () => {
        removeEntity(helperEntity)
        rigComponent.helperEntity.set(none)
      }
    }, [visible, debugEnabled, pending, rigComponent.normalizedRig])

    useEffect(() => {
      if (!modelComponent?.asset?.value) return
      const model = getComponent(entity, ModelComponent)
      setComponent(entity, AvatarRigComponent, {
        vrm: model.asset as VRM,
        avatarURL: model.src
      })
      return () => {
        if (!entityExists(entity)) return
        setComponent(entity, AvatarRigComponent, {
          vrm: null!,
          avatarURL: null
        })
      }
    }, [modelComponent?.asset])

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
        if (manager.loadedAnimations[locomotionAnimation].value) retargetAvatarAnimations(entity)
      } catch (e) {
        console.error('Failed to load avatar', e)
        if ((getComponent(entity, UUIDComponent) as any) === Engine.instance.userID) AvatarState.selectRandomAvatar()
      }
    }, [rigComponent.vrm, locomotionAnimationState])

    const manager = useHookstate(getMutableState(AnimationState))

    useEffect(() => {
      if (
        !manager.loadedAnimations[locomotionAnimation].value ||
        !rigComponent?.vrm?.value ||
        !rigComponent?.normalizedRig?.value ||
        getComponent(entity, AnimationComponent).animations.length
      )
        return
      try {
        retargetAvatarAnimations(entity)
      } catch (e) {
        console.error('Failed to retarget avatar animations', e)
        if ((getComponent(entity, UUIDComponent) as any) === Engine.instance.userID) AvatarState.selectRandomAvatar()
      }
    }, [manager.loadedAnimations, rigComponent.vrm])

    return null
  }
})

/**Used to generate an offset map that retargets ik position animations to fit any rig */
export const retargetIkUtility = (entity: Entity, bindTracks: KeyframeTrack[], height: number, flipped: boolean) => {
  const offset = new Vector3()
  const foot = new Vector3()

  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig.normalizedRig.hips?.node) return

  const avatarComponent = getComponent(entity, AvatarComponent)
  const scaleMultiplier = height / avatarComponent.avatarHeight

  offset.y = rig.normalizedRig.rightFoot.node.getWorldPosition(foot).y * 2 * scaleMultiplier - 0.05

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
          rig.normalizedRig[key.replace('Target', '')].node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.normalizedRig[key].node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'rightElbowHint':
        bonePos.copy(
          rig.normalizedRig.rightLowerArm.node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.normalizedRig.rightLowerArm.node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'leftElbowHint':
        bonePos.copy(
          rig.normalizedRig.leftLowerArm.node.matrixWorld.multiply(
            new Matrix4()
              .setPosition(rig.normalizedRig.leftLowerArm.node.getWorldDirection(new Vector3()))
              .multiplyScalar(direction * -1)
          )
        )
        break
      case 'rightKneeHint':
        bonePos.copy(
          rig.normalizedRig.rightLowerLeg.node.matrixWorld.multiply(
            new Matrix4().setPosition(
              rig.normalizedRig.rightLowerLeg.node.getWorldDirection(new Vector3()).multiplyScalar(direction)
            )
          )
        )
        break
      case 'leftKneeHint':
        bonePos.copy(
          rig.normalizedRig.leftLowerLeg.node.matrixWorld.multiply(
            new Matrix4().setPosition(
              rig.normalizedRig.rightLowerLeg.node.getWorldDirection(new Vector3()).multiplyScalar(direction)
            )
          )
        )
        break
      case 'headHint':
        bonePos.copy(rig.normalizedRig.head.node.matrixWorld)
      case 'hipsTarget':
        bonePos.copy(rig.normalizedRig.hips.node.matrixWorld)
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

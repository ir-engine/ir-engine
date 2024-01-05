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
import { Box3, Vector3 } from 'three'
import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

const size = new Vector3()
const hipsPos = new Vector3(),
  headPos = new Vector3(),
  leftFootPos = new Vector3(),
  rightFootPos = new Vector3(),
  leftLowerLegPos = new Vector3(),
  leftUpperLegPos = new Vector3(),
  footGap = new Vector3(),
  eyePos = new Vector3()
export const AvatarComponent = defineComponent({
  name: 'AvatarComponent',

  onInit: (entity) => {
    return {
      avatarHeight: 0,
      avatarHalfHeight: 0,
      /** The length of the torso in a t-pose, from the hip joint to the head joint */
      torsoLength: 0,
      /** The length of the upper leg in a t-pose, from the hip joint to the knee joint */
      upperLegLength: 0,
      /** The length of the lower leg in a t-pose, from the knee joint to the ankle joint */
      lowerLegLength: 0,
      /** The height of the foot in a t-pose, from the ankle joint to the bottom of the avatar's model */
      footHeight: 0,
      /** The height of the hips in a t-pose */
      hipsHeight: 0,
      /** The length of the arm in a t-pose, from the shoulder joint to the elbow joint */
      armLength: 0,
      /** The distance between the left and right foot in a t-pose */
      footGap: 0,
      /** The height of the eyes in a t-pose */
      eyeHeight: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.avatarHeight)) component.avatarHeight.set(json.avatarHeight)
    if (matches.number.test(json.avatarHalfHeight)) component.avatarHalfHeight.set(json.avatarHalfHeight)
    if (matches.number.test(json.torsoLength)) component.torsoLength.set(json.torsoLength)
    if (matches.number.test(json.upperLegLength)) component.upperLegLength.set(json.upperLegLength)
    if (matches.number.test(json.lowerLegLength)) component.lowerLegLength.set(json.lowerLegLength)
    if (matches.number.test(json.footHeight)) component.footHeight.set(json.footHeight)
    if (matches.number.test(json.hipsHeight)) component.hipsHeight.set(json.hipsHeight)
    if (matches.number.test(json.footGap)) component.footGap.set(json.footGap)
    if (matches.number.test(json.eyeHeight)) component.eyeHeight.set(json.eyeHeight)
  },

  reactor: () => {
    const entity = useEntityContext()
    const avatarComponent = useComponent(entity, AvatarComponent)
    const modelComponent = useComponent(entity, ModelComponent)
    useEffect(() => {
      if (!modelComponent.asset.value) return
      const scene = modelComponent.asset.value.scene
      if (!scene) return
      const box = new Box3()
      box.expandByObject(scene).getSize(size)
      avatarComponent.avatarHeight.set(size.y)
      avatarComponent.avatarHalfHeight.set(size.y * 0.5)
    }, [modelComponent.asset])

    const rigComponent = useComponent(entity, AvatarRigComponent)
    useEffect(() => {
      if (!rigComponent.normalizedRig.value) return
      const rig = rigComponent.normalizedRig.value
      rig.hips.node.getWorldPosition(hipsPos)
      rig.head.node.getWorldPosition(headPos)
      rig.leftFoot.node.getWorldPosition(leftFootPos)
      rig.rightFoot.node.getWorldPosition(rightFootPos)
      rig.leftLowerLeg.node.getWorldPosition(leftLowerLegPos)
      rig.leftUpperLeg.node.getWorldPosition(leftUpperLegPos)
      rig.leftEye ? rig.leftEye?.node.getWorldPosition(eyePos) : eyePos.copy(headPos)

      avatarComponent.torsoLength.set(headPos.y - hipsPos.y)
      avatarComponent.upperLegLength.set(hipsPos.y - leftLowerLegPos.y)
      avatarComponent.lowerLegLength.set(leftFootPos.y - leftUpperLegPos.y)
      avatarComponent.hipsHeight.set(hipsPos.y)
      avatarComponent.eyeHeight.set(eyePos.y)
      avatarComponent.footGap.set(footGap.subVectors(leftFootPos, rightFootPos).length())
    }, [rigComponent.normalizedRig])
    return null
  }
})

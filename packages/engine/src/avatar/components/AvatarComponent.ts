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
import { defineComponent, getComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

const size = new Vector3()
const vec3 = new Vector3()
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
      armLength: 0,
      footGap: 0
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
      const transform = getComponent(entity, TransformComponent)
      avatarComponent.torsoLength.set(rig.head.node.getWorldPosition(vec3).y - rig.hips.node.getWorldPosition(vec3).y)
      avatarComponent.upperLegLength.set(
        rig.hips.node.getWorldPosition(vec3).y - rig.leftLowerLeg.node.getWorldPosition(vec3).y
      )
      avatarComponent.lowerLegLength.set(
        rig.leftFoot.node.getWorldPosition(vec3).y - rig.leftUpperLeg.node.getWorldPosition(vec3).y
      )
      avatarComponent.hipsHeight.set(rig.hips.node.getWorldPosition(vec3).y)
      console.log(rigComponent.value.vrm.scene.getWorldPosition(vec3))

      avatarComponent.footGap.set(
        vec3.subVectors(rig.leftFoot.node.getWorldPosition(vec3), rig.rightFoot.node.getWorldPosition(vec3)).length()
      )
    }, [rigComponent.normalizedRig])
    return null

    return null
  }
})

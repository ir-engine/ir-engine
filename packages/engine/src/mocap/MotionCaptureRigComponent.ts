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

import { NormalizedLandmark } from '@mediapipe/tasks-vision'
import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import { useEffect } from 'react'

import { defineComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { ECSSchema } from '@ir-engine/ecs/src/ComponentSchemaUtils'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'

export const MotionCaptureRigComponent = defineComponent({
  name: 'MotionCaptureRigComponent',

  schema: {
    rig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, ECSSchema.Quaternion])) as Record<
      VRMHumanBoneName,
      typeof ECSSchema.Quaternion
    >,
    slerpedRig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, ECSSchema.Quaternion])) as Record<
      VRMHumanBoneName,
      typeof ECSSchema.Quaternion
    >,
    hipPosition: ECSSchema.Vec3,
    hipRotation: ECSSchema.Quaternion,
    footOffset: 'f64',
    solvingLowerBody: 'ui8'
  },

  onInit: (initial) => {
    return {
      /** @todo if these have a fixed max length we can move them into the ecs schema */
      prevWorldLandmarks: null as NormalizedLandmark[] | null,
      prevScreenLandmarks: null as NormalizedLandmark[] | null
    }
  },

  reactor: function () {
    const entity = useEntityContext()

    useEffect(() => {
      for (const boneName of VRMHumanBoneList) {
        //causes issues with ik solves, commenting out for now
        //proxifyVector3(AvatarRigComponent.rig[boneName].position, entity)
        //proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity)
      }
      MotionCaptureRigComponent.solvingLowerBody[entity] = 1
    }, [])

    return null
  }
})

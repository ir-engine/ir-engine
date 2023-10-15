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

import { VRMHumanBoneList, VRMHumanBoneName } from '@pixiv/three-vrm'
import { useEffect } from 'react'
import { defineComponent } from '../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../ecs/functions/EntityFunctions'
import { QuaternionSchema, Vector3Schema } from '../transform/components/TransformComponent'

export const MotionCaptureRigComponent = defineComponent({
  name: 'MotionCaptureRigComponent',
  onInit: () => true,
  schema: {
    rig: Object.fromEntries(VRMHumanBoneList.map((b) => [b, QuaternionSchema])) as Record<
      VRMHumanBoneName,
      typeof QuaternionSchema
    >,
    hipPosition: Vector3Schema,
    hipRotation: QuaternionSchema,
    solvingLowerBody: 'ui8'
  },

  reactor: function () {
    const entity = useEntityContext()

    useEffect(() => {
      for (const boneName of VRMHumanBoneList) {
        //proxifyVector3(AvatarRigComponent.rig[boneName].position, entity)
        //proxifyQuaternion(AvatarRigComponent.rig[boneName].rotation, entity)
      }
      MotionCaptureRigComponent.solvingLowerBody[entity] = 1
    }, [])

    return null
  }
})

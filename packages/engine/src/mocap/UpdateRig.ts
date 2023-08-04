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

import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Euler, Quaternion, Vector3 } from 'three'

const useIk = true
const updateRigPosition = (name, position, dampener, lerpAmount, rig) => {
  const vector = new Vector3(
    (position?.x || 0) * dampener,
    (position?.y || 0) * dampener,
    (position?.z || 0) * dampener
  )

  const Part = rig.vrm.humanoid!.getNormalizedBoneNode(VRMHumanBoneName[name])
  if (!Part) {
    console.log(`can't position ${name}`)
    return
  }
  Part.position.lerp(vector, lerpAmount) // interpolate
}

const updateRigRotation = (name, rotation, dampener, lerpAmount, rig) => {
  const quaternion = new Quaternion().setFromEuler(
    new Euler(
      (rotation?.x || 0) * dampener,
      (rotation?.y || 0) * dampener,
      (rotation?.z || 0) * dampener,
      rotation?.rotationOrder || 'XYZ'
    )
  )

  console.log(rotation)

  const Part = rig.vrm.humanoid!.getNormalizedBoneNode(VRMHumanBoneName[name])
  if (!Part) {
    console.log(`can't rotate ${name} - ${VRMHumanBoneName[name]}`)
    return
  }

  Part.quaternion.slerp(quaternion.clone(), lerpAmount) // interpolate
}

export { updateRigPosition, updateRigRotation }

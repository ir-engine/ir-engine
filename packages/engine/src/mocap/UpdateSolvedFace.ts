/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License") you may not use this file except in compliance
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

import { VRMExpressionPresetName } from '@pixiv/three-vrm'
import { Face, Vector } from 'kalidokit/dist/kalidokit.umd.js'
import { Euler } from 'three'
import { updateRigRotation } from './UpdateRig'

const oldLookTarget = new Euler()
const UpdateSolvedFace = (data, hipsPos, avatarRig, avatarTransform) => {
  // if (!vrm) {
  //   return;
  // }
  if (data) {
    updateRigRotation('Neck', data.head, 0.7, 0.3, avatarRig)

    // Blendshapes and Preset Name Schema
    const Blendshape = avatarRig?.vrm?.expressionManager!
    const PresetName = VRMExpressionPresetName

    // Simple example without winking. Interpolate based on old blendshape, then stabilize blink with `Kalidokit` helper function.
    // for VRM, 1 is closed, 0 is open.

    const newLeye = new Vector().clamp(1 - data.eye.l, 0, 1)
    data.eye.l = new Vector().lerp(newLeye, Blendshape.getValue(PresetName.Blink)!, 0.5)
    data.eye.r = lerp(clamp(1 - data.eye.r, 0, 1), Blendshape.getValue(PresetName.Blink)!, 0.5)
    data.eye = Face.stabilizeBlink(data.eye, data.head.y)
    Blendshape.setValue(PresetName.Blink, data.eye.l)

    // Interpolate and set mouth blendshapes
    Blendshape.setValue(PresetName.Ih, lerp(data.mouth.shape.I, Blendshape.getValue(PresetName.Ih)!, 0.5) as number)
    Blendshape.setValue(PresetName.Aa, lerp(data.mouth.shape.A, Blendshape.getValue(PresetName.Aa)!, 0.5) as number)
    Blendshape.setValue(PresetName.Ee, lerp(data.mouth.shape.E, Blendshape.getValue(PresetName.Ee)!, 0.5) as number)
    Blendshape.setValue(PresetName.Ou, lerp(data.mouth.shape.O, Blendshape.getValue(PresetName.Ou)!, 0.5) as number)
    Blendshape.setValue(PresetName.Oh, lerp(data.mouth.shape.U, Blendshape.getValue(PresetName.Oh)!, 0.5) as number)

    //PUPILS
    //interpolate pupil and keep a copy of the value
    const lookTarget = new Euler(
      lerp(oldLookTarget.x, data.pupil.y, 0.4),
      lerp(oldLookTarget.y, data.pupil.x, 0.4),
      0,
      'XYZ'
    )
    oldLookTarget.copy(lookTarget)
    avatarRig?.vrm?.lookAt!.applier!.lookAt(lookTarget)
  }
}

export default UpdateSolvedFace
function lerp(arg0: any, arg1: any, arg2: number): any {
  throw new Error('Function not implemented.')
}

function clamp(arg0: number, arg1: number, arg2: number): any {
  throw new Error('Function not implemented.')
}

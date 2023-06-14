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

import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { ReferenceSpace } from './XRState'

const targetRaySpace = {} as XRSpace

const screenInputSource = {
  handedness: 'none',
  targetRayMode: 'screen',
  get targetRaySpace() {
    if (Engine.instance.xrFrame) {
      return ReferenceSpace.viewer!
    }
    return targetRaySpace
  },
  gripSpace: undefined,
  gamepad: {
    axes: new Array(2).fill(0),
    buttons: [],
    connected: true,
    hapticActuators: [],
    id: '',
    index: 0,
    mapping: 'xr-standard',
    timestamp: Date.now()
  },
  profiles: [],
  hand: undefined
}
const defaultInputSourceArray = [screenInputSource] as XRInputSource[]

const execute = () => {
  const now = Date.now()
  screenInputSource.gamepad.timestamp = now

  if (Engine.instance.xrFrame) {
    const session = Engine.instance.xrFrame.session
    // session.inputSources is undefined when the session is ending, we should probably use xrState.sessionActive instead of Engine.instance.xrFrame
    const inputSources = session.inputSources ? session.inputSources : []
    Engine.instance.inputSources = [...defaultInputSourceArray, ...inputSources]
  } else {
    Engine.instance.inputSources = defaultInputSourceArray
  }
}

export const XRInputSourceSystem = defineSystem({
  uuid: 'ee.engine.XRInputSourceSystem',
  execute
})

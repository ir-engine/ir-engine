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

import { useEffect } from 'react'

import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { InputSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineActionQueue, getMutableState } from '@ir-engine/hyperflux'

import { xrSessionChanged } from './XRSessionFunctions'
import { XRAction, XRState } from './XRState'

/**
 * System for XR session and input handling
 */

const updateSessionSupportForMode = (mode: XRSessionMode) => {
  navigator.xr
    ?.isSessionSupported(mode)
    .then((supported) => getMutableState(XRState).supportedSessionModes[mode].set(supported))
}

const updateSessionSupport = () => {
  updateSessionSupportForMode('inline')
  updateSessionSupportForMode('immersive-ar')
  updateSessionSupportForMode('immersive-vr')
}

const xrSessionChangedQueue = defineActionQueue(XRAction.sessionChanged.matches)

const execute = () => {
  for (const action of xrSessionChangedQueue()) xrSessionChanged(action)
}

const reactor = () => {
  useEffect(() => {
    navigator.xr?.addEventListener('devicechange', updateSessionSupport)
    updateSessionSupport()

    return () => {
      navigator.xr?.removeEventListener('devicechange', updateSessionSupport)
    }
  }, [])
  return null
}

export const XRSystem = defineSystem({
  uuid: 'ee.engine.XRSystem',
  insert: { before: InputSystemGroup },
  execute,
  reactor
})

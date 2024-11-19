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

/**
 * @fileoverview
 * Exports the tools most used in unit tests from the webxr-emulator.
 * @why Ergonomics. Allows all imports to come from a single file.
 * */

import { PRIVATE as XRSESSION_SYMBOL } from 'webxr-polyfill/src/api/XRSession'
import { requestXRSession } from '../../src/xr/XRSessionFunctions'
import { WebXREventDispatcher } from '../../tests/webxr/emulator/WebXREventDispatcher'
import { POLYFILL_ACTIONS } from '../../tests/webxr/emulator/actions'

/* @section Forward Exports from the emulator module. */
export { CustomWebXRPolyfill } from '../../tests/webxr/emulator/CustomWebXRPolyfill'
export { WebXREventDispatcher } from '../../tests/webxr/emulator/WebXREventDispatcher'
export { POLYFILL_ACTIONS } from '../../tests/webxr/emulator/actions'

/**
 * @description Returns the data of the @param session XRSession passed in by accessing it with its Symbol() name
 * @why Shorthand for getting the data of the session in an ergonomic way.
 * */
export function getXRSessionData(session: XRSession | null) {
  if (session === null) return null
  return session[XRSESSION_SYMBOL]
}

/**
 * @description Returns the data of the last session found at the `@param session` passed.
 * @why Shorthand for getting the last session data in an ergonomic way.
 * */
export function getLastXRSessionData(session: XRSession | null) {
  // @ts-ignore TEMP: Allow access to unknown. @todo Typecast into the correct type
  return Array.from(getXRSessionData(session).device.sessions).at(-1).at(-1)
}

/**
 * @description Requests an emulated XRSession.
 * @why Shorthand for initializing an emulated XRSession from unit tests
 * */
export async function requestEmulatedXRSession(device = DeviceDefinitions.Default) {
  WebXREventDispatcher.instance.dispatchEvent({
    type: POLYFILL_ACTIONS.DEVICE_INIT,
    detail: { stereoEffect: false, device }
  })
  return requestXRSession()
}

export const OculusQuest = {
  id: 'Oculus Quest',
  name: 'Oculus Quest',
  modes: ['inline', 'immersive-vr'],
  headset: {
    hasPosition: true,
    hasRotation: true
  },
  controllers: [
    {
      id: 'Oculus Touch (Right)',
      buttonNum: 7,
      primaryButtonIndex: 0,
      primarySqueezeButtonIndex: 1,
      hasPosition: true,
      hasRotation: true,
      hasSqueezeButton: true,
      isComplex: true
    },
    {
      id: 'Oculus Touch (Left)',
      buttonNum: 7,
      primaryButtonIndex: 0,
      primarySqueezeButtonIndex: 1,
      hasPosition: true,
      hasRotation: true,
      hasSqueezeButton: true,
      isComplex: true
    }
  ]
}

export const DeviceDefinitions = {
  Default: OculusQuest,
  OculusQuest
}

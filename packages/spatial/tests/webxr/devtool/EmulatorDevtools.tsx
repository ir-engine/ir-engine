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

import { useHookstate, useImmediateEffect, useMutableState } from '@ir-engine/hyperflux'
import { endXRSession, requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import React from 'react'

import { overrideXR } from '../src/functions/xrBotHookFunctions.js'
import EmulatedDevice from './js/emulatedDevice.js'
import { EmulatorSettings, emulatorStates } from './js/emulatorStates.js'
import { syncDevicePose } from './js/messenger.js'
import Devtool from './jsx/app'
import devtoolCSS from './styles/index.css?inline'

import { XRState } from '@ir-engine/spatial/src/xr/XRState.js'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

const setup = async (mode: 'immersive-vr' | 'immersive-ar') => {
  await overrideXR({ mode })
  await EmulatorSettings.instance.load()
  const device = new EmulatedDevice()
  device.on('pose', syncDevicePose)
  ;(emulatorStates as any).emulatedDevice = device

  return device
}

export const EmulatorDevtools = (props: { mode: 'immersive-vr' | 'immersive-ar' }) => {
  const xrState = useMutableState(XRState)
  const xrActive = xrState.sessionActive.value && !xrState.requestingSession.value

  const deviceState = useHookstate(null as null | EmulatedDevice)
  useImmediateEffect(() => {
    setup(props.mode).then((device) => {
      deviceState.set(device)
    })
  }, [])

  const toggleXR = async () => {
    if (xrActive) {
      endXRSession()
    } else {
      requestXRSession({ mode: props.mode })
    }
  }

  const togglePlacement = () => {
    if (xrState.scenePlacementMode.value !== 'placing') {
      xrState.scenePlacementMode.set('placing')
      xrState.sceneScaleAutoMode.set(false)
      xrState.sceneScaleTarget.set(0.1)
    } else {
      xrState.scenePlacementMode.set('placed')
    }
  }

  return (
    <>
      <style type="text/css">{devtoolCSS.toString()}</style>
      <div
        id="devtools"
        className="flex-no-wrap m-0 flex h-full h-full select-none flex-col overflow-hidden overflow-hidden bg-gray-900 text-xs text-gray-900"
      >
        <div className="flex-no-wrap flex h-10 select-none flex-row bg-gray-800 text-xs text-gray-900">
          <Button className="my-1 ml-auto mr-6 px-10" onClick={toggleXR} disabled={xrState.requestingSession.value}>
            {(xrActive ? 'Exit ' : 'Enter ') + (props.mode === 'immersive-ar' ? 'AR' : 'VR')}
          </Button>
          {props.mode === 'immersive-ar' && (
            <Button className="my-1 ml-auto mr-6 px-10" onClick={togglePlacement} disabled={!xrActive}>
              Place Scene
            </Button>
          )}
        </div>
        {deviceState.value && <Devtool device={deviceState.value} />}
      </div>
    </>
  )
}

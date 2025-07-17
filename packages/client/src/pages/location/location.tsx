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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React, { Suspense, useRef } from 'react'
import { Route, Routes } from 'react-router-dom'

import '../../engine'

import Debug from '@ir-engine/client-core/src/components/Debug'
import { useBrowserCheck } from '@ir-engine/client-core/src/hooks/useUnsupported'
import LocationPage from '@ir-engine/client-core/src/world/Location'
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

import { MultiplayerState } from '@ir-engine/client-core/src/common/services/MultiplayerState'
import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { LoadingUISystemState } from '@ir-engine/client-core/src/systems/LoadingUISystem'
import { getMutableState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import '../styles.scss'

const LocationRoutes = () => {
  const ref = useRef<HTMLElement>(document.body)
  const ready = useHookstate(getMutableState(LoadingUISystemState).ready).value
  const progress = useHookstate(getMutableState(LoadingUISystemState).progress).value

  useSpatialEngine()
  useEngineCanvas(ref)
  useBrowserCheck()

  const projectsLoaded = useEngineInjection()

  const multiplayer = useMutableState(MultiplayerState).world

  return (
    <Suspense>
      {projectsLoaded && (
        <Routes>
          <Route path=":locationName/*" element={<LocationPage online={multiplayer.value} />} />
        </Routes>
      )}
      {!ready && (
        <div className="relative flex h-dvh w-dvw items-center justify-center bg-white" style={{ zIndex: 100 }}>
          <LoadingView
            fullScreen
            animated
            title={t('common:loader.loadingApp')}
            titleClassname="text-black"
            progress={progress}
          />
        </div>
      )}
      <Debug />
    </Suspense>
  )
}

export default LocationRoutes

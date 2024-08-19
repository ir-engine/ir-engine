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

import { t } from 'i18next'
import React, { Suspense, useRef } from 'react'
import { Route, Routes } from 'react-router-dom'

import { useEngineInjection } from '@ir-engine/client-core/src/components/World/EngineHooks'
import { useEngineCanvas } from '@ir-engine/client-core/src/hooks/useEngineCanvas'
import LocationPage from '@ir-engine/client-core/src/world/Location'
import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'

const LocationRoutes = () => {
  const ref = useRef<HTMLElement>(document.body)
  useEngineCanvas(ref)

  const projectsLoaded = useEngineInjection()

  if (!projectsLoaded)
    return <LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingProjects')} />

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingLocation')} />}
    >
      <Routes>
        <Route path=":locationName" element={<LocationPage online />} />
      </Routes>
    </Suspense>
  )
}

export default LocationRoutes

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

import React, { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Dashboard from '@etherealengine/ui/src/primitives/mui/Dashboard'

import { LoadingCircle } from '../components/LoadingCircle'
import { AuthState } from '../user/services/AuthService'
import { UserUISystem } from '../user/UserUISystem'
import Analytics from './components/Analytics'

const $allowed = lazy(() => import('@etherealengine/client-core/src/admin/allowedRoutes'))

const AdminSystemInjection = () => {
  startSystems([UserUISystem], { after: PresentationSystemGroup })
}

const AdminRoutes = () => {
  const location = useLocation()
  const admin = useHookstate(getMutableState(AuthState)).user

  let allowedRoutes = {
    analytics: false,
    location: false,
    user: false,
    bot: false,
    scene: false,
    channel: false,
    instance: false,
    invite: false,
    globalAvatars: false,
    static_resource: false,
    benchmarking: false,
    routes: false,
    projects: false,
    settings: false,
    server: false,
    recording: false
  }
  const scopes = admin?.scopes?.value || []

  useEffect(() => {
    AdminSystemInjection()
    dispatchAction(EngineActions.initializeEngine({ initialised: true }))
  }, [])

  scopes.forEach((scope) => {
    if (Object.keys(allowedRoutes).includes(scope.type.split(':')[0])) {
      if (scope.type.split(':')[1] === 'read') {
        allowedRoutes = {
          ...allowedRoutes,
          [scope.type.split(':')[0]]: true
        }
      }
    }
  })

  if (admin?.id?.value?.length! > 0 && !admin?.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
    return <Navigate to={{ pathname: '/' }} />
  }

  return (
    <Dashboard>
      <Suspense fallback={<LoadingCircle message={`Loading ${location.pathname.split('/')[2]}...`} />}>
        <Routes>
          <Route path="/*" element={<$allowed allowedRoutes={allowedRoutes} />} />
          {<Route path="/" element={<Analytics />} />}
        </Routes>
      </Suspense>
    </Dashboard>
  )
}

export default AdminRoutes

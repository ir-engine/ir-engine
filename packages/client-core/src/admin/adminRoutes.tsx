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

import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Dashboard from '@etherealengine/ui/src/primitives/mui/Dashboard'

import { LoadingCircle } from '../components/LoadingCircle'
import { AuthState } from '../user/services/AuthService'
import { AllowedAdminRoutesState } from './AllowedAdminRoutesState'
import Analytics from './components/Analytics'
import { DefaultAdminRoutes } from './DefaultAdminRoutes'

import '@etherealengine/engine/src/EngineModule'

const $allowed = lazy(() => import('@etherealengine/client-core/src/admin/allowedRoutes'))

const AdminRoutes = () => {
  const location = useLocation()
  const admin = useHookstate(getMutableState(AuthState)).user

  const allowedRoutes = useHookstate(getMutableState(AllowedAdminRoutesState))

  const scopes = admin?.scopes?.value

  useEffect(() => {
    allowedRoutes.set(DefaultAdminRoutes)
  }, [])

  useEffect(() => {
    for (const [route, state] of Object.entries(allowedRoutes)) {
      const routeScope = state.scope.value
      const hasScope =
        routeScope === '' ||
        scopes?.find((scope) => {
          const [scopeKey, type] = scope.type.split(':')
          return Array.isArray(routeScope) ? routeScope.includes(scopeKey) : scopeKey === routeScope
        })
      state.access.set(!!hasScope)
    }
  }, [scopes])

  if (admin?.id?.value?.length! > 0 && !admin?.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
    return <Navigate to={{ pathname: '/' }} />
  }

  return (
    <Dashboard>
      <Suspense fallback={<LoadingCircle message={`Loading ${location.pathname.split('/')[2]}...`} />}>
        <Routes>
          <Route path="/*" element={<$allowed />} />
          {<Route path="/" element={<Analytics />} />}
        </Routes>
      </Suspense>
    </Dashboard>
  )
}

export default AdminRoutes

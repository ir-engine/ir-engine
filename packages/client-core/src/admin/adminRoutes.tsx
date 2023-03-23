import { t } from 'i18next'
import React, { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { initSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { dispatchAction } from '@etherealengine/hyperflux'
import Dashboard from '@etherealengine/ui/src/primitives/mui/Dashboard'

import { LoadingCircle } from '../components/LoadingCircle'
import AdminSystem from '../systems/AdminSystem'
import { useAuthState } from '../user/services/AuthService'
import Analytics from './components/Analytics'

const $allowed = lazy(() => import('@etherealengine/client-core/src/admin/allowedRoutes'))

const AdminSystemInjection = {
  uuid: 'core.admin.AdminSystem',
  type: 'PRE_RENDER',
  systemLoader: () => Promise.resolve({ default: AdminSystem })
} as const

const AdminRoutes = () => {
  const location = useLocation()
  const admin = useAuthState().user

  let allowedRoutes = {
    analytics: false,
    location: false,
    user: false,
    bot: false,
    scene: false,
    party: false,
    groups: false,
    instance: false,
    invite: false,
    globalAvatars: false,
    static_resource: false,
    benchmarking: false,
    routes: false,
    projects: false,
    settings: false,
    server: false
  }
  const scopes = admin?.scopes?.value || []

  useEffect(() => {
    initSystems([AdminSystemInjection]).then(async () => {
      // @ts-ignore
      dispatchAction(EngineActions.initializeEngine({ initialised: true }))
    })
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

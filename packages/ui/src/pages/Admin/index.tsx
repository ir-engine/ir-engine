import React, { lazy, Suspense, useEffect } from 'react'
import {
  // Navigate,
  Route,
  Routes,
  useLocation
} from 'react-router-dom'

import Analytics from '@etherealengine/client-core/src/admin/components/Analytics'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { AdminSystem } from '@etherealengine/client-core/src/systems/AdminSystem'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { UserUISystem } from '@etherealengine/client-core/src/user/UserUISystem'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { startSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Dashboard from '@etherealengine/ui/src/components/admin/Dashboard'

const $allowed = lazy(() => import('@etherealengine/client-core/src/admin/allowedRoutes'))

const AdminSystemInjection = () => {
  startSystems([AdminSystem, UserUISystem], { after: PresentationSystemGroup })
}

const AdminPage = () => {
  const location = useLocation()
  const admin = useHookstate(getMutableState(AuthState)).user

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

  // if (admin?.id?.value?.length > 0 && !admin?.scopes?.value?.find((scope) => scope.type === 'admin:admin')) {
  //   return <Navigate to={{ pathname: '/' }} />
  // }

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

AdminPage.displayName = 'AdminPage'
AdminPage.defaultProps = {}

export default AdminPage

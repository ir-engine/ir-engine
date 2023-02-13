import React, { lazy, Suspense, useEffect } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { dispatchAction } from '@xrengine/hyperflux'

import CircularProgress from '@mui/material/CircularProgress'

import PrivateRoute from '../Private'
import AdminSystem from '../systems/AdminSystem'
import Dashboard from '../user/components/Dashboard'
import { useAuthState } from '../user/services/AuthService'

const analytics = lazy(() => import('./components/Analytics'))
const avatars = lazy(() => import('./components/Avatars'))
const benchmarking = lazy(() => import('./components/Benchmarking'))
const botSetting = lazy(() => import('./components/Bots'))
const groups = lazy(() => import('./components/Group'))
const instance = lazy(() => import('./components/Instance'))
const invites = lazy(() => import('./components/Invite'))
const locations = lazy(() => import('./components/Location'))
const party = lazy(() => import('./components/Party'))
const projects = lazy(() => import('./components/Project'))
const resources = lazy(() => import('./components/Resources'))
const routes = lazy(() => import('./components/Routes'))
const server = lazy(() => import('./components/Server'))
const setting = lazy(() => import('./components/Setting'))
const users = lazy(() => import('./components/Users'))

const AdminSystemInjection = {
  uuid: 'core.admin.AdminSystem',
  type: 'PRE_RENDER',
  systemLoader: () => Promise.resolve({ default: AdminSystem })
} as const

const ProtectedRoutes = () => {
  const admin = useAuthState().user
  const { isEngineInitialized } = useEngineState().value

  let allowedRoutes = {
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
    initSystems(Engine.instance.currentWorld, [AdminSystemInjection]).then(async () => {
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
    return <Redirect to={{ pathname: '/', state: { from: '/admin' } }} />
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <Dashboard>
        <Suspense
          fallback={
            <div
              style={{
                height: '100vh',
                width: '100%',
                textAlign: 'center',
                pointerEvents: 'auto',
                paddingTop: 'calc(50vh - 7px)'
              }}
            >
              <CircularProgress />
            </div>
          }
        >
          <Switch>
            {allowedRoutes.globalAvatars && <PrivateRoute exact path="/admin/avatars" component={avatars} />}
            {allowedRoutes.benchmarking && <PrivateRoute exact path="/admin/benchmarking" component={benchmarking} />}
            {allowedRoutes.groups && <PrivateRoute exact path="/admin/groups" component={groups} />}
            {allowedRoutes.instance && <PrivateRoute exact path="/admin/instance" component={instance} />}
            {allowedRoutes.invite && <PrivateRoute exact path="/admin/invites" component={invites} />}
            {allowedRoutes.location && <PrivateRoute exact path="/admin/locations" component={locations} />}
            {allowedRoutes.routes && <PrivateRoute exact path="/admin/routes" component={routes} />}
            {allowedRoutes.party && <PrivateRoute exact path="/admin/parties" component={party} />}
            {allowedRoutes.bot && <PrivateRoute exact path="/admin/bots" component={botSetting} />}
            {allowedRoutes.projects && <PrivateRoute exact path="/admin/projects" component={projects} />}
            {allowedRoutes.server && <PrivateRoute exact path="/admin/server" component={server} />}
            {allowedRoutes.settings && <PrivateRoute exact path="/admin/settings" component={setting} />}
            {allowedRoutes.static_resource && <PrivateRoute exact path="/admin/resources" component={resources} />}
            {allowedRoutes.user && <PrivateRoute exact path="/admin/users" component={users} />}
            <PrivateRoute exact path="/admin/*" component={() => <Redirect to="/admin" />} />
            <PrivateRoute path="/admin" component={analytics} />
          </Switch>
        </Suspense>
      </Dashboard>
    </div>
  )
}

export default ProtectedRoutes

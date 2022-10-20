import React, { Suspense, useEffect } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { initializeCoreSystems } from '@xrengine/engine/src/initializeCoreSystems'
import { initializeSceneSystems } from '@xrengine/engine/src/initializeSceneSystems'

import CircularProgress from '@mui/material/CircularProgress'

import PrivateRoute from '../Private'
import { useAuthState } from '../user/services/AuthService'
import LoadingView from './common/LoadingView'

const analytic = React.lazy(() => import('./components/Analytics'))
const avatars = React.lazy(() => import('./components/Avatars'))
const benchmarking = React.lazy(() => import('./components/Benchmarking'))
const groups = React.lazy(() => import('./components/Group'))
const instance = React.lazy(() => import('./components/Instance'))
const invites = React.lazy(() => import('./components/Invite'))
const locations = React.lazy(() => import('./components/Location'))
const routes = React.lazy(() => import('./components/Routes'))
const users = React.lazy(() => import('./components/Users'))
const party = React.lazy(() => import('./components/Party'))
const botSetting = React.lazy(() => import('./components/Bots'))
const projects = React.lazy(() => import('./components/Project'))
const setting = React.lazy(() => import('./components/Setting'))
const resources = React.lazy(() => import('./components/Resources'))

const AdminSystemInjection = {
  uuid: 'core.admin.AdminSystem',
  type: 'PRE_RENDER',
  systemLoader: () => import('../systems/AdminSystem')
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
    settings: false
  }
  const scopes = admin?.scopes?.value || []

  useEffect(() => {
    initializeCoreSystems([AdminSystemInjection]).then(async () => {
      await initializeSceneSystems()
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
        {!isEngineInitialized && <LoadingView sx={{ height: '100vh' }} />}
        {isEngineInitialized && (
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
            {allowedRoutes.settings && <PrivateRoute exact path="/admin/settings" component={setting} />}
            {allowedRoutes.static_resource && <PrivateRoute exact path="/admin/resources" component={resources} />}
            {allowedRoutes.user && <PrivateRoute exact path="/admin/users" component={users} />}
            <PrivateRoute exact path="/admin/*" component={() => <Redirect to="/admin" />} />
            <PrivateRoute path="/admin" component={analytic} />
          </Switch>
        )}
      </Suspense>
    </div>
  )
}

export default ProtectedRoutes

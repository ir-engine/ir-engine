import React, { Suspense, useEffect } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { initializeCoreSystems } from '@xrengine/engine/src/initializeCoreSystems'
import { initializeSceneSystems } from '@xrengine/engine/src/initializeSceneSystems'

import CircularProgress from '@mui/material/CircularProgress'

import PrivateRoute from '../Private'
import AdminSystem from '../systems/AdminSystem'
import { useAuthState } from '../user/services/AuthService'
import LoadingView from './common/LoadingView'
import analytics from './components/Analytics'
import avatars from './components/Avatars'
import benchmarking from './components/Benchmarking'
import botSetting from './components/Bots'
import groups from './components/Group'
import instance from './components/Instance'
import invites from './components/Invite'
import locations from './components/Location'
import party from './components/Party'
import projects from './components/Project'
import resources from './components/Resources'
import routes from './components/Routes'
import server from './components/Server'
import setting from './components/Setting'
import users from './components/Users'

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
            {allowedRoutes.server && <PrivateRoute exact path="/admin/server" component={server} />}
            {allowedRoutes.settings && <PrivateRoute exact path="/admin/settings" component={setting} />}
            {allowedRoutes.static_resource && <PrivateRoute exact path="/admin/resources" component={resources} />}
            {allowedRoutes.user && <PrivateRoute exact path="/admin/users" component={users} />}
            <PrivateRoute exact path="/admin/*" component={() => <Redirect to="/admin" />} />
            <PrivateRoute path="/admin" component={analytics} />
          </Switch>
        )}
      </Suspense>
    </div>
  )
}

export default ProtectedRoutes

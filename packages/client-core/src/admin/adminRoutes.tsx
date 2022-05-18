import React, { Fragment, Suspense, useEffect } from 'react'
import { Redirect, Switch } from 'react-router-dom'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineService'
import { initializeCoreSystems, initializeSceneSystems } from '@xrengine/engine/src/initializeEngine'
import { dispatchAction } from '@xrengine/hyperflux'

import CircularProgress from '@mui/material/CircularProgress'

import PrivateRoute from '../Private'
import { useAuthState } from '../user/services/AuthService'

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

interface Props {}

const canvasStyle = {
  zIndex: -1,
  width: '100%',
  height: '100%',
  position: 'fixed',
  WebkitUserSelect: 'none',
  pointerEvents: 'auto',
  userSelect: 'none',
  visibility: 'hidden'
} as React.CSSProperties
const engineRendererCanvasId = 'engine-renderer-canvas'
const canvas = <canvas id={engineRendererCanvasId} style={canvasStyle} />

const ProtectedRoutes = (props: Props) => {
  const admin = useAuthState().user

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
    benchmarking: false
  }
  const scopes = admin?.scopes?.value || []

  useEffect(() => {
    initializeCoreSystems().then(async () => {
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

  if (admin?.id?.value?.length! > 0 && admin?.userRole?.value !== 'admin') {
    return <Redirect to={{ pathname: '/', state: { from: '/admin' } }} />
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      {canvas}
      <Fragment>
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
            <PrivateRoute exact path="/admin" component={analytic} />
            <PrivateRoute exact path="/admin/avatars" component={avatars} />
            <PrivateRoute exact path="/admin/benchmarking" component={benchmarking} />
            <PrivateRoute exact path="/admin/groups" component={groups} />
            <PrivateRoute exact path="/admin/instance" component={instance} />
            <PrivateRoute exact path="/admin/invites" component={invites} />
            <PrivateRoute exact path="/admin/locations" component={locations} />
            <PrivateRoute exact path="/admin/routes" component={routes} />
            {/* <PrivateRoute exact path="/admin/scenes" component={scenes} /> */}
            <PrivateRoute exact path="/admin/parties" component={party} />
            <PrivateRoute exact path="/admin/bots" component={botSetting} />
            {/* <PrivateRoute exact path="/admin/armedia" component={arMedia} /> */}
            {/* <PrivateRoute exact path="/admin/armedia" component={arMedia} />
            <PrivateRoute exact path="/admin/feeds" component={feeds} />
            <PrivateRoute exact path="/admin/creator" component={creator} /> */}
            <PrivateRoute exact path="/admin/projects" component={projects} />
            <PrivateRoute exact path="/admin/settings" component={setting} />
            {/* <PrivateRoute exact path="/admin/settings" component={setting} />
            <PrivateRoute exact path="/admin/armedia" component={arMedia} />
            <PrivateRoute exact path="/admin/feeds" component={feeds} />
            <PrivateRoute exact path="/admin/creator" component={creator} /> */}
            <PrivateRoute exact path="/admin/settings" component={setting} />
            <PrivateRoute exact Path="/admin/users" component={users} />
          </Switch>
        </Suspense>
      </Fragment>
    </div>
  )
}

export default ProtectedRoutes

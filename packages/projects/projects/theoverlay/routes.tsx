import React from 'react'
import { Route, Redirect } from 'react-router-dom'

export const routes = ['/', '/login', '/harmony', '/admin', '/location', '/auth', '/editor']

export default function (route: string) {
  switch (route) {
    case '/':
      return [
        <Route key={'/'} path={'/'} component={React.lazy(() => import('@xrengine/client/src/pages/index'))} exact />
      ]
    case '/login':
      return [
        <Route
          key={'/login'}
          path={'/login'}
          component={React.lazy(() => import('@xrengine/client/src/pages/login'))}
        />
      ]
    case '/harmony':
      return [
        <Route
          key={'/harmony'}
          path={'/harmony'}
          component={React.lazy(() => import('@xrengine/client/src/pages/harmony/index'))}
        />
      ]
    case '/admin':
      return [
        <Route
          key={'/admin'}
          path={'/admin'}
          component={React.lazy(() => import('@xrengine/client-core/src/admin/adminRoutes'))}
        />
      ]
    case '/location':
      return [
        <Route
          key={'/location'}
          path={'/location'}
          component={React.lazy(() => import('@xrengine/client/src/pages/location/location'))}
        />
      ]
    case '/auth':
      return [
        <Route
          key={'/auth'}
          path={'/auth'}
          component={React.lazy(() => import('@xrengine/client-core/src/admin/adminRoutes'))}
        />
      ]
    case '/editor':
      return [
        <Route
          key={'/editor'}
          path={'/editor'}
          component={React.lazy(() => import('@xrengine/client/src/pages/editor/editor'))}
        />,
        <Redirect key={'/editor redirect'} path="/editor" to="/editor/projects" />
      ]
  }

  // TODO: add test routes
  /*
  <Route path="/test" component={React.lazy(() => import('../pages/examples/test_three'))} />
  <Route path="/examples/ikrig" component={React.lazy(() => import('../pages/examples/ikrig'))} />
  <Route path="/examples/navmesh" component={React.lazy(() => import('../pages/examples/navmesh'))} />
  <Route
    path="/examples/navmeshbuilder"
    component={React.lazy(() => import('../pages/examples/NavMeshBuilder'))}
  />
  <Route path="/asset-test" component={React.lazy(() => import('../pages/examples/asset-test'))} />
  <Route path="/map-test" component={React.lazy(() => import('../pages/examples/map-test'))} />

  <Route
    path="/offline/:locationName"
    component={React.lazy(() => import('../pages/offline/[locationName]'))}
  />
  <Route path="/offline" component={React.lazy(() => import('../pages/offline/[locationName]'))} />
  <Route path="/event/:locationName" component={React.lazy(() => import('../pages/location/[locationName]'))} />
  */
}

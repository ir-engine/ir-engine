import React from 'react'
import { Route, Redirect } from 'react-router-dom'

const $ = React.lazy(() => import('@xrengine/client/src/pages/index'))
const $login = React.lazy(() => import('@xrengine/client/src/pages/login'))
const $harmony = React.lazy(() => import('@xrengine/client/src/pages/harmony/index'))
const $location = React.lazy(() => import('@xrengine/client/src/pages/location/location'))
const $auth = React.lazy(() => import('@xrengine/client/src/pages/auth/authRoutes'))
const $editor = React.lazy(() => import('@xrengine/client/src/pages/editor/editor'))
const $examples = React.lazy(() => import('@xrengine/client/src/pages/examples/index'))

export default function (route: string) {
  console.log('route', route)
  switch (route) {
    case '/':
      return [<Route key={'/'} path={'/'} component={$} exact />]
    case '/login':
      return [<Route key={'/login'} path={'/login'} component={$login} />]
    case '/harmony':
      return [<Route key={'/harmony'} path={'/harmony'} component={$harmony} />]
    case '/location':
      return [<Route key={'/location'} path={'/location'} component={$location} />]
    case '/auth':
      return [<Route key={'/auth'} path={'/auth'} component={$auth} />]
    case '/editor':
      return [<Route key={'/editor'} path={'/editor'} component={$editor} />]
    case '/examples':
      return [<Route key={'/examples'} path={'/examples'} component={$examples} />]
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

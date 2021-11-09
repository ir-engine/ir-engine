import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import { Config } from '@xrengine/common/src/config'
import ProtectedRoute from './protected'
import EditorProtected from './EditorProtected'
import homePage from '../pages/index'
import CircularProgress from '@material-ui/core/CircularProgress'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}
class RouterComp extends React.Component<{}, { hasError: boolean }> {
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  constructor(props) {
    super(props)

    this.state = { hasError: false }
  }

  componentDidCatch() {
    setTimeout(() => {
      this.setState({ hasError: false })
    }, 2000)
  }

  render() {
    if (this.state.hasError) return <div>Working...</div>

    return (
      <Suspense
        fallback={
          <div
            style={{
              height: '100vh',
              width: '100%',
              textAlign: 'center',
              paddingTop: 'calc(50vh - 7px)'
            }}
          >
            <CircularProgress />
          </div>
        }
      >
        <Switch>
          <Route path="/" component={homePage} exact />
          <Route path="/login" component={React.lazy(() => import('../pages/login'))} />
          <Route path="/inventory/:id" component={React.lazy(() => import('../pages/inventory'))} />

          {/* Admin Routes*/}
          <Route path="/admin" component={ProtectedRoute} />

          {/* Dev Routes */}
          <Route path="/test" component={React.lazy(() => import('../pages/examples/test_three'))} />
          <Route path="/examples/ikrig" component={React.lazy(() => import('../pages/examples/ikrig'))} />
          <Route path="/examples/navmesh" component={React.lazy(() => import('../pages/examples/navmesh'))} />
          <Route
            path="/examples/navmeshbuilder"
            component={React.lazy(() => import('../pages/examples/NavMeshBuilder'))}
          />
          <Route path="/asset-test" component={React.lazy(() => import('../pages/examples/asset-test'))} />
          <Route path="/map-test" component={React.lazy(() => import('../pages/examples/map-test'))} />

          {/* Auth Routes */}
          <Route path="/auth/oauth/facebook" component={React.lazy(() => import('../pages/auth/oauth/facebook'))} />
          <Route path="/auth/oauth/github" component={React.lazy(() => import('../pages/auth/oauth/github'))} />
          <Route path="/auth/oauth/google" component={React.lazy(() => import('../pages/auth/oauth/google'))} />
          <Route path="/auth/oauth/linkedin" component={React.lazy(() => import('../pages/auth/oauth/linkedin'))} />
          <Route path="/auth/oauth/twitter" component={React.lazy(() => import('../pages/auth/oauth/twitter'))} />
          <Route path="/auth/confirm" component={React.lazy(() => import('../pages/auth/confirm'))} />
          <Route path="/auth/forgotpassword" component={React.lazy(() => import('../pages/auth/forgotpassword'))} />
          <Route path="/auth/magiclink" component={React.lazy(() => import('../pages/auth/magiclink'))} />

          {/* Location Routes */}
          <Route
            path="/location/:locationName"
            component={React.lazy(() => import('../pages/location/[locationName]'))}
          />
          <Route path="/mappa/:locationName" component={React.lazy(() => import('../pages/map/[locationName]'))} />
          <Route path="/map/:locationName" component={React.lazy(() => import('../pages/map/[locationName]'))} />
          <Redirect path="/location" to={'/location/' + Config.publicRuntimeConfig.lobbyLocationName} />

          <Route path="/golf/:locationName" component={React.lazy(() => import('../pages/golf/[locationName]'))} />
          <Route
            path="/offline/:locationName"
            component={React.lazy(() => import('../pages/offline/[locationName]'))}
          />
          <Route path="/offline" component={React.lazy(() => import('../pages/offline/[locationName]'))} />

          {/* Starter Template */}
          <Route
            path="/starter/:locationName"
            component={React.lazy(() => import('../pages/starter/[locationName]'))}
          />

          {/* Harmony Routes */}
          <Route path="/harmony" component={React.lazy(() => import('../pages/harmony/index'))} />

          {/* Editor Routes */}
          <Route path="/editor" component={EditorProtected} />

          <Route path="*" component={React.lazy(() => import('../pages/404'))} />
        </Switch>
      </Suspense>
    )
  }
}

export default RouterComp

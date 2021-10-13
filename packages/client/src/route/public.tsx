import React, { Suspense } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import homePage from '../pages/index'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCustomRoutes } from './getCustomRoutes'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

type CustomRoute = {
  id: string
  route: string
  page: any
}

class RouterComp extends React.Component<{}, { hasError: boolean; customRoutes: CustomRoute[] }> {
  static getDerivedStateFromError() {
    return { hasError: true }
  }

  constructor(props) {
    super(props)

    this.state = {
      hasError: false,
      customRoutes: undefined as any
    }

    this.getCustomRoutes()
  }

  getCustomRoutes() {
    getCustomRoutes().then((routes) => {
      this.setState({
        customRoutes: routes
      })
    })
  }

  componentDidCatch() {
    setTimeout(() => {
      this.setState({ hasError: false })
    }, 2000)
  }

  render() {
    console.log(this.state.customRoutes)
    if (this.state.hasError || this.state.customRoutes === undefined) return <div>Working...</div>
    let i
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

          <Route
            path="/offline/:locationName"
            component={React.lazy(() => import('../pages/offline/[locationName]'))}
          />
          <Route path="/offline" component={React.lazy(() => import('../pages/offline/[locationName]'))} />
          <Route path="/event/:locationName" component={React.lazy(() => import('../pages/location/[locationName]'))} />

          {/* Harmony Routes */}
          <Route path="/harmony" component={React.lazy(() => import('../pages/harmony/index'))} />

          {/* Custom Routes */}
          {this.state.customRoutes.map(({ route, page }) => {
            return <Route key={i++} path={'/' + route} component={React.lazy(() => page)} />
          })}

          <Route path="*" component={React.lazy(() => import('../pages/404'))} />
        </Switch>
      </Suspense>
    )
  }
}

export default RouterComp

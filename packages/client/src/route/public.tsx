import React, { Suspense } from 'react'
import { Route, Switch } from 'react-router-dom'
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
      customRoutes: []
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
    if (this.state.hasError || !this.state.customRoutes.length) return <div>Working...</div>
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
          {/* this needs to have the map function */}
          {this.state.customRoutes.map((r) => r)}
          {/* if no index page has been provided, indicate this as obviously as possible */}
          <Route key={'/'} path={'/'} component={React.lazy(() => import('../pages/503'))} exact />
          <Route path="*" component={React.lazy(() => import('../pages/404'))} />
        </Switch>
      </Suspense>
    )
  }
}

export default RouterComp

import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCustomRoutes } from './getCustomRoutes'
import ErrorBoundary from '../components/ErrorBoundary'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

type CustomRoute = {
  id: string
  route: string
  page: any
}

function RouterComp(props) {
  const [customRoutes, setCustomRoutes] = useState([] as CustomRoute[])

  useEffect(() => {
    if (customRoutes.length) return
    getCustomRoutes().then((routes) => {
      setCustomRoutes(routes)
    })
  }, [])

  if (!customRoutes.length) {
    return <div>Loading...</div>
  }

  return (
    <ErrorBoundary>
      <React.Fragment>
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
            {customRoutes.map((r) => r)}
            {/* if no index page has been provided, indicate this as obviously as possible */}
            <Route key={'/'} path={'/'} component={React.lazy(() => import('../pages/503'))} exact />
            <Route path="*" component={React.lazy(() => import('../pages/404'))} />
          </Switch>
        </Suspense>
      </React.Fragment>
    </ErrorBoundary>
  )
}

export default RouterComp

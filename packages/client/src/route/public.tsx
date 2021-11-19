import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import { CustomRoute, getCustomRoutes } from './getCustomRoutes'
import ErrorBoundary from '@xrengine/client-core/src/common/components/ErrorBoundary'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

const $admin = React.lazy(() => import('@xrengine/client-core/src/admin/adminRoutes'))
const $auth = React.lazy(() => import('@xrengine/client/src/pages/auth/authRoutes'))
const $login = React.lazy(() => import('@xrengine/client/src/pages/login'))
const $503 = React.lazy(() => import('../pages/503'))
const $404 = React.lazy(() => import('../pages/404'))

function RouterComp(props) {
  const [customRoutes, setCustomRoutes] = useState(null as any as CustomRoute[])

  useEffect(() => {
    getCustomRoutes().then((routes) => {
      setCustomRoutes(routes)
    })
  }, [])

  if (!customRoutes) {
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
            <Switch>
              {customRoutes.map((route, i) => {
                return (
                  <Route key={`custom-route-${i}`} path={route.route} component={route.component} {...route.props} />
                )
              })}
            </Switch>
            {/* default to allowing admin access regardless */}
            <Route key={'default-admin'} path={'/admin'} component={$admin} />
            <Route key={'default-login'} path={'/login'} component={$login} />
            <Route key={'default-auth'} path={'/auth'} component={$auth} />
            {/* if no index page has been provided, indicate this as obviously as possible */}
            <Route key={'/503'} path={'/'} component={$503} exact />
            <Route key={'404'} path="*" component={$404} />
          </Switch>
        </Suspense>
      </React.Fragment>
    </ErrorBoundary>
  )
}

export default RouterComp

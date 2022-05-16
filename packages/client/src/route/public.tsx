import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'

import ErrorBoundary from '@xrengine/client-core/src/common/components/ErrorBoundary'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { AuthService } from '@xrengine/client-core/src/user/services/AuthService'

import { CustomRoute, getCustomRoutes } from './getCustomRoutes'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

const $admin = React.lazy(() => import('@xrengine/client-core/src/admin/adminRoutes'))
const $auth = React.lazy(() => import('@xrengine/client/src/pages/auth/authRoutes'))
const $offline = React.lazy(() => import('@xrengine/client/src/pages/offline/offline'))
const $503 = React.lazy(() => import('../pages/503'))
const $404 = React.lazy(() => import('../pages/404'))

function RouterComp(props) {
  const [customRoutes, setCustomRoutes] = useState(null as any as CustomRoute[])

  useEffect(() => {
    AuthService.doLoginAuto()
    getCustomRoutes().then((routes) => {
      setCustomRoutes(routes)
    })
  }, [])

  if (!customRoutes) {
    return <LoadingCircle />
  }

  return (
    <ErrorBoundary>
      <React.Fragment>
        <Suspense fallback={<LoadingCircle />}>
          <Switch>
            {customRoutes.map((route, i) => (
              <Route key={`custom-route-${i}`} path={route.route} component={route.component} {...route.props} />
            ))}
            <Route key={'offline'} path={'/offline'} component={$offline} />
            {/* default to allowing admin access regardless */}
            <Route key={'default-admin'} path={'/admin'} component={$admin} />
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

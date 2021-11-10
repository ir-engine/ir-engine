import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch } from 'react-router-dom'
import CircularProgress from '@mui/material/CircularProgress'
import { getCustomRoutes } from './getCustomRoutes'
import ErrorBoundary from '@xrengine/client-core/src/common/components/ErrorBoundary'
import { useTranslation } from 'react-i18next'

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

type CustomRoute = {
  id: string
  route: string
  page: any
}

const $adminRoute = React.lazy(() => import('@xrengine/client-core/src/admin/adminRoutes'))
const $503 = React.lazy(() => import('../pages/503'))
const $404 = React.lazy(() => import('../pages/404'))

function RouterComp(props) {
  const [customRoutes, setCustomRoutes] = useState(null as any as CustomRoute[])

  const { t } = useTranslation()

  useEffect(() => {
    getCustomRoutes().then((routes) => {
      setCustomRoutes(routes)
    })
  }, [])

  if (!customRoutes) {
    return <div>Loading...</div>
  }

  if (Array.isArray(customRoutes) && !customRoutes.length) {
    return (
      <>
        <h1 style={{ color: 'black' }}>{t('no-projects.msg')}</h1>
        <img src="/static/xrengine.png" />
      </>
    )
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
            {customRoutes}
            {/* default to allowing admin access regardless */}
            <Route key={'/admin'} path={'/admin'} component={$adminRoute} />
            {/* if no index page has been provided, indicate this as obviously as possible */}
            <Route key={'/503'} path={'/'} component={$503} exact />
            <Route key={'*504'} path="*" component={$404} />
          </Switch>
        </Suspense>
      </React.Fragment>
    </ErrorBoundary>
  )
}

export default RouterComp

import './hookstate_devtools.es'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { initialize } from './util'

const AppPage = React.lazy(() => import('./pages/_app'))

import('./env-config').then((module) => {
  const envConfig = module.default
  // Initialize i18n and client-core
  envConfig()
  initialize()
    // then load the app
    .then((_) => {
      ReactDOM.render(
        <Suspense fallback="Loading...">
          <AppPage />
        </Suspense>,
        document.getElementById('root')
      )
    })
})

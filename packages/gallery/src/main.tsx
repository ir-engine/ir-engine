import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { initialize } from './util'

import('./env-config').then((module) => {
  const envConfig = module.default
  envConfig()
  // Initialize i18n and client-core
  initialize()
    // then load the app
    .then((_) => {
      const StoreProvider = React.lazy(() => import('./pages/_app'))
      ReactDOM.render(
        <Suspense fallback={<></>}>
          <StoreProvider />
        </Suspense>,
        document.getElementById('root')
      )
    })
})

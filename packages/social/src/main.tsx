import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { initialize } from './util'
import Splash from '@xrengine/social/src/components/Splash'

import('./env-config').then((module) => {
  const envConfig = module.default
  envConfig()
  // Initialize i18n and client-core
  initialize()
    // then load the app
    .then((_) => {
      const StoreProvider = React.lazy(() => import('./pages/_app'))
      ReactDOM.render(
        <Suspense fallback={<Splash />}>
          {/* @ts-ignore */}
          <StoreProvider />
        </Suspense>,
        document.getElementById('root')
      )
    })
})

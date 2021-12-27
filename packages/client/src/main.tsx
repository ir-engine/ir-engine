import './hookstate_devtools.es'
import './env-config'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import { initialize } from './util'

const AppPage = React.lazy(() => import('./pages/_app'))

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

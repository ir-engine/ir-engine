import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'
import './env-config'
import './hookstate_devtools.es'
import './pages/styles.scss'
import { initialize } from './util'

const AppPage = React.lazy(() => import('./pages/_app'))

const Loading = () => {
  return (
    <div className={'body_loading'}>
      <div className={'lds_ellipsis'}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

initialize()
  // then load the app
  .then((_) => {
    ReactDOM.render(
      <Suspense fallback={<Loading />}>
        <AppPage />
      </Suspense>,
      document.getElementById('root')
    )
  })

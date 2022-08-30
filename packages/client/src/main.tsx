import React, { Suspense } from 'react'
import ReactDOM from 'react-dom'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle' //@ts-ignore

;(globalThis as any).process = { env: { ...(import.meta as any).env, APP_ENV: (import.meta as any).env.MODE } }

const Engine = React.lazy(() => import('./engine'))

const App = () => {
  return (
    <Suspense fallback={<LoadingCircle />}>
      <Engine />
    </Suspense>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))

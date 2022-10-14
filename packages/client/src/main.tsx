import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle' //@ts-ignore

;(globalThis as any).process = { env: { ...(import.meta as any).env, APP_ENV: (import.meta as any).env.MODE } }

const Engine = React.lazy(() => import('./engine'))

const App = () => {
  return (
    <Suspense fallback={<LoadingCircle message={'Starting up...'} />}>
      <Engine />
    </Suspense>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)

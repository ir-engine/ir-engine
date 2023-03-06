import { t } from 'i18next'
import React, { lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle' //@ts-ignore

;(globalThis as any).process = { env: { ...(import.meta as any).env, APP_ENV: (import.meta as any).env.MODE } }

const Engine = lazy(() => import('./engine'))

const App = () => {
  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.starting')} />}>
      <Engine />
    </Suspense>
  )
}

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(<App />)

import { t } from 'i18next'
import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

const Recorder = lazy(() => import('./[locationName]'))

const RecorderRoutes = () => {
  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingLocation')} />}>
      <Routes>
        <Route path=":locationName" element={<Recorder />} />
        {/* <Route path="" element={<Recorder />} /> */}
      </Routes>
    </Suspense>
  )
}

export default RecorderRoutes

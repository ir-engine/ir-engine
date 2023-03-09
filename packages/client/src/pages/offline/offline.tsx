import { t } from 'i18next'
import React, { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

const LocationPage = lazy(() => import('./[locationName]'))

const LocationRoutes = () => {
  useEffect(() => {
    console.log('offline route loaded')
  }, [])
  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.offline')} />}>
      <Routes>
        <Route path=":projectName/:sceneName" element={<LocationPage />} />
        <Route path=":locationName" element={<LocationPage />} />
      </Routes>
    </Suspense>
  )
}

export default LocationRoutes

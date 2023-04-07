import { t } from 'i18next'
import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import LocationPage from '@etherealengine/client-core/src/world/Location'

const LocationRoutes = () => {
  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingLocation')} />}>
      <Routes>
        <Route path=":projectName/:sceneName" element={<LocationPage />} />
        <Route path=":locationName" element={<LocationPage />} />
      </Routes>
    </Suspense>
  )
}

export default LocationRoutes

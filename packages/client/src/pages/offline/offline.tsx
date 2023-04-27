import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import LocationPage from '@etherealengine/client-core/src/world/Location'

const LocationRoutes = () => {
  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.offline')} />}>
      <Routes>
        <Route path=":projectName/:sceneName" element={<LocationPage offline />} />
        <Route path=":locationName" element={<LocationPage offline />} />
      </Routes>
    </Suspense>
  )
}

export default LocationRoutes

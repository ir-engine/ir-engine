import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

const CustomRoutes = ({ customRoutes }) => {
  if (customRoutes === null) return <Routes></Routes>

  const location = useLocation()
  const { pathname } = location

  // Improve loading by only using matched route
  const matchedRoutes = customRoutes.filter((r) => {
    return r.route.split('/')[1], pathname.split('/')[1]
  })

  return (
    <Suspense fallback={<LoadingCircle message={t('common:loader.loadingCustom')} />}>
      <Routes>
        {matchedRoutes.map((route, i) => {
          const { route: r, component, props: p } = route
          const Element = component as any
          return (
            <Route
              key={`custom-route-${i}`}
              path={r.split('/')[1] === '' ? `${r}*` : `${r}/*`}
              element={<Element />}
              {...p}
            />
          )
        })}
      </Routes>
    </Suspense>
  )
}

export default CustomRoutes

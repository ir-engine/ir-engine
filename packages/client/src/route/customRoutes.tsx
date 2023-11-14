/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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

/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { t } from 'i18next'
import React, { Suspense } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'

import { NO_PROXY, useMutableState } from '@ir-engine/hyperflux'

import LoadingView from '@ir-engine/ui/src/primitives/tailwind/LoadingView'
import { Redirect } from '../common/components/Redirect'
import { AllowedAdminRoutesState } from './AllowedAdminRoutesState'

const AllowedRoutes = () => {
  const location = useLocation()
  const { pathname } = location

  const allowedRoutes = useMutableState(AllowedAdminRoutesState)

  const path = pathname.split('/')[2]

  const currentRoute = allowedRoutes[path]

  const allowedRoutesKeys = Object.keys(allowedRoutes)
  if (!path) {
    for (const key of allowedRoutesKeys) {
      const allowedRoute = allowedRoutes[key]
      if (allowedRoute?.value && allowedRoute?.value?.access) {
        return <Redirect to={`/admin/${key}`} />
      }
    }
  }

  if (currentRoute?.value && currentRoute.redirect.value) return <Redirect to={currentRoute.redirect?.value} />

  const Element = currentRoute?.get(NO_PROXY)?.component
  const allowed = currentRoute?.access?.value

  return (
    <Suspense
      fallback={<LoadingView fullScreen className="block h-12 w-12" title={t('common:loader.loadingAllowed')} />}
    >
      <Routes>{allowed && Element && <Route key={path} path={`*`} element={<Element />} />}</Routes>
    </Suspense>
  )
}

export default AllowedRoutes

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
import React, { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation } from 'react-router-dom'

import {
  AuthSettingsService,
  AuthSettingsServiceReceptor,
  AuthSettingsState
} from '@etherealengine/client-core/src/admin/services/Setting/AuthSettingService'
import {
  AdminClientSettingsState,
  ClientSettingsServiceReceptor
} from '@etherealengine/client-core/src/admin/services/Setting/ClientSettingService'
import ErrorBoundary from '@etherealengine/client-core/src/common/components/ErrorBoundary'
import { ProjectServiceReceptor } from '@etherealengine/client-core/src/common/services/ProjectService'
import { useCustomRoutes } from '@etherealengine/client-core/src/common/services/RouterService'
import { LocationServiceReceptor } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthService, AuthServiceReceptor } from '@etherealengine/client-core/src/user/services/AuthService'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import $404 from '../pages/404'
import $503 from '../pages/503'

const $custom = lazy(() => import('@etherealengine/client/src/route/customRoutes'))

const CenteredLoadingCircle = () => {
  return (
    <div className="absolute w-screen h-screen flex justify-center items-center">
      <LoadingCircle className={`block w-12 h-12`} message={t('common:loader.loadingRoutes')} />
    </div>
  )
}

function PublicRouter() {
  const customRoutes = useCustomRoutes()
  const clientSettingsState = useHookstate(getMutableState(AdminClientSettingsState))
  const authSettingsState = useHookstate(getMutableState(AuthSettingsState))
  const location = useLocation()
  const [routesReady, setRoutesReady] = useState(false)

  useEffect(() => {
    addActionReceptor(ClientSettingsServiceReceptor)
    addActionReceptor(AuthSettingsServiceReceptor)
    addActionReceptor(AuthServiceReceptor)
    addActionReceptor(LocationServiceReceptor)
    addActionReceptor(ProjectServiceReceptor)

    // Oauth callbacks may be running when a guest identity-provider has been deleted.
    // This would normally cause doLoginAuto to make a guest user, which we do not want.
    // Instead, just skip it on oauth callbacks, and the callback handler will log them in.
    // The client and auth settigns will not be needed on these routes
    if (!/auth\/oauth/.test(location.pathname)) {
      AuthService.doLoginAuto()
      AuthSettingsService.fetchAuthSetting()
    }

    return () => {
      removeActionReceptor(ClientSettingsServiceReceptor)
      removeActionReceptor(AuthSettingsServiceReceptor)
      removeActionReceptor(AuthServiceReceptor)
      removeActionReceptor(LocationServiceReceptor)
      removeActionReceptor(ProjectServiceReceptor)
    }
  }, [])

  useEffect(() => {
    // For the same reason as above, we will not need to load the client and auth settings for these routes
    if (/auth\/oauth/.test(location.pathname) && customRoutes) return setRoutesReady(true)
    if (clientSettingsState.client.value.length && authSettingsState.authSettings.value.length && customRoutes)
      return setRoutesReady(true)
  }, [clientSettingsState.client.length, authSettingsState.authSettings.length, customRoutes])

  if (!routesReady) {
    return <CenteredLoadingCircle />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<CenteredLoadingCircle />}>
        <Routes>
          <Route
            key={'custom'}
            path={'/*'}
            element={<$custom customRoutes={customRoutes.filter((c) => c.route !== '/admin')} />}
          />
          {customRoutes
            .filter((c) => c.route === '/')
            .map(({ component: Element, props }) => (
              <Route key={'custom-index'} path={'/'} element={<Element {...props} />} />
            ))}
          {/* if no index page has been provided, indicate this as obviously as possible */}
          <Route key={'/503'} path={'/'} element={<$503 />} />
          <Route key={'404'} path="*" element={<$404 />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

export default PublicRouter

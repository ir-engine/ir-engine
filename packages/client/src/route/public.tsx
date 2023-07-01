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

import React, { lazy, Suspense, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

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
import { RouterServiceReceptor, useCustomRoutes } from '@etherealengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'
import { LocationServiceReceptor } from '@etherealengine/client-core/src/social/services/LocationService'
import { AuthService, AuthServiceReceptor } from '@etherealengine/client-core/src/user/services/AuthService'
import { addActionReceptor, getMutableState, removeActionReceptor, useHookstate } from '@etherealengine/hyperflux'

const $index = lazy(() => import('@etherealengine/client/src/pages'))
const $offline = lazy(() => import('@etherealengine/client/src/pages/offline/offline'))
const $admin = lazy(() => import('@etherealengine/client-core/src/admin/adminRoutes'))
const $studio = lazy(() => import('@etherealengine/client/src/pages/editor/editor'))
const $location = lazy(() => import('@etherealengine/client/src/pages/location/location'))

/** @deprecated see https://github.com/EtherealEngine/etherealengine/issues/6485 */
function RouterComp({ route }: { route: string }) {
  const customRoutes = useCustomRoutes()
  const clientSettingsState = useHookstate(getMutableState(AdminClientSettingsState))
  const authSettingsState = useHookstate(getMutableState(AuthSettingsState))
  const location = useLocation()
  const routesReady = useHookstate(false)
  const { t } = useTranslation()

  useEffect(() => {
    addActionReceptor(RouterServiceReceptor)
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
      removeActionReceptor(RouterServiceReceptor)
      removeActionReceptor(ClientSettingsServiceReceptor)
      removeActionReceptor(AuthSettingsServiceReceptor)
      removeActionReceptor(AuthServiceReceptor)
      removeActionReceptor(LocationServiceReceptor)
      removeActionReceptor(ProjectServiceReceptor)
    }
  }, [])

  useEffect(() => {
    // For the same reason as above, we will not need to load the client and auth settings for these routes
    if (/auth\/oauth/.test(location.pathname) && customRoutes) return routesReady.set(true)
    if (clientSettingsState.client.value.length && authSettingsState.authSettings.value.length && customRoutes)
      return routesReady.set(true)
  }, [clientSettingsState.client.length, authSettingsState.authSettings.length, customRoutes])

  if (!routesReady.value) {
    return <LoadingCircle message={t('common:loader.loadingRoutes')} />
  }

  let RouteElement

  switch (route) {
    case 'index':
      RouteElement = $index
      break
    case 'offline':
      RouteElement = $offline
      break
    case 'studio':
      RouteElement = $studio
      break
    case 'admin':
      RouteElement = $admin
      break
    case 'location':
      RouteElement = $location
      break
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingCircle message={t('common:loader.loadingRoute')} />}>
        <RouteElement />
      </Suspense>
    </ErrorBoundary>
  )
}

export default RouterComp

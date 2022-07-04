import React, { Suspense, useEffect, useState } from 'react'
import { Route, Switch, useLocation } from 'react-router-dom'

import {
  AuthSettingsService,
  AuthSettingsServiceReceptor,
  useAuthSettingState
} from '@xrengine/client-core/src/admin/services/Setting/AuthSettingService'
import {
  ClientSettingService,
  ClientSettingsServiceReceptor,
  useClientSettingState
} from '@xrengine/client-core/src/admin/services/Setting/ClientSettingService'
import ErrorBoundary from '@xrengine/client-core/src/common/components/ErrorBoundary'
import { AppServiceReceptor } from '@xrengine/client-core/src/common/services/AppService'
import { DialogServiceReceptor } from '@xrengine/client-core/src/common/services/DialogService'
import { MediaInstanceConnectionServiceReceptor } from '@xrengine/client-core/src/common/services/MediaInstanceConnectionService'
import { ProjectServiceReceptor } from '@xrengine/client-core/src/common/services/ProjectService'
import { LoadingCircle } from '@xrengine/client-core/src/components/LoadingCircle'
import { InviteService, InviteServiceReceptor } from '@xrengine/client-core/src/social/services/InviteService'
import { LocationServiceReceptor } from '@xrengine/client-core/src/social/services/LocationService'
import { AuthService, AuthServiceReceptor } from '@xrengine/client-core/src/user/services/AuthService'
import {
  LocalStateServiceReceptor,
  StoredLocalAction,
  StoredLocalStoreService
} from '@xrengine/client-core/src/util/StoredLocalState'
import { addActionReceptor, dispatchAction, removeActionReceptor } from '@xrengine/hyperflux'

import { CustomRoute, getCustomRoutes } from './getCustomRoutes'

const $admin = React.lazy(() => import('@xrengine/client-core/src/admin/adminRoutes'))
const $auth = React.lazy(() => import('@xrengine/client/src/pages/auth/authRoutes'))
const $offline = React.lazy(() => import('@xrengine/client/src/pages/offline/offline'))
const $503 = React.lazy(() => import('../pages/503'))
const $404 = React.lazy(() => import('../pages/404'))

function RouterComp() {
  const [customRoutes, setCustomRoutes] = useState(null as any as CustomRoute[])
  const clientSettingsState = useClientSettingState()
  const authSettingsState = useAuthSettingState()
  const location = useLocation()
  const [routesReady, setRoutesReady] = useState(false)

  InviteService.useAPIListeners()

  useEffect(() => {
    addActionReceptor(LocalStateServiceReceptor)
    addActionReceptor(ClientSettingsServiceReceptor)
    addActionReceptor(AuthSettingsServiceReceptor)
    addActionReceptor(AuthServiceReceptor)
    addActionReceptor(InviteServiceReceptor)
    addActionReceptor(LocationServiceReceptor)
    addActionReceptor(DialogServiceReceptor)
    addActionReceptor(AppServiceReceptor)
    addActionReceptor(ProjectServiceReceptor)
    addActionReceptor(MediaInstanceConnectionServiceReceptor)

    dispatchAction(StoredLocalAction.restoreLocalData())
    StoredLocalStoreService.fetchLocalStoredState()

    // Oauth callbacks may be running when a guest identity-provider has been deleted.
    // This would normally cause doLoginAuto to make a guest user, which we do not want.
    // Instead, just skip it on oauth callbacks, and the callback handler will log them in.
    // The client and auth settigns will not be needed on these routes
    if (!/auth\/oauth/.test(location.pathname)) {
      AuthService.doLoginAuto()
      AuthSettingsService.fetchAuthSetting()
    }
    getCustomRoutes().then((routes) => {
      setCustomRoutes(routes)
    })

    return () => {
      removeActionReceptor(LocalStateServiceReceptor)
      removeActionReceptor(ClientSettingsServiceReceptor)
      removeActionReceptor(AuthSettingsServiceReceptor)
      removeActionReceptor(AuthServiceReceptor)
      removeActionReceptor(InviteServiceReceptor)
      removeActionReceptor(LocationServiceReceptor)
      removeActionReceptor(DialogServiceReceptor)
      removeActionReceptor(AppServiceReceptor)
      removeActionReceptor(ProjectServiceReceptor)
      removeActionReceptor(MediaInstanceConnectionServiceReceptor)
    }
  }, [])

  useEffect(() => {
    // For the same reason as above, we will not need to load the client and auth settings for these routes
    if (/auth\/oauth/.test(location.pathname) && customRoutes) return setRoutesReady(true)
    if (clientSettingsState.client.value.length && authSettingsState.authSettings.value.length && customRoutes)
      return setRoutesReady(true)
  }, [clientSettingsState.client.length, authSettingsState.authSettings.length, customRoutes])

  if (!routesReady) {
    return <LoadingCircle />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingCircle />}>
        <Switch>
          {customRoutes.map((route, i) => (
            <Route key={`custom-route-${i}`} path={route.route} component={route.component} {...route.props} />
          ))}
          <Route key={'offline'} path={'/offline'} component={$offline} />
          {/* default to allowing admin access regardless */}
          <Route key={'default-admin'} path={'/admin'} component={$admin} />
          <Route key={'default-auth'} path={'/auth'} component={$auth} />
          {/* if no index page has been provided, indicate this as obviously as possible */}
          <Route key={'/503'} path={'/'} component={$503} exact />
          <Route key={'404'} path="*" component={$404} />
        </Switch>
      </Suspense>
    </ErrorBoundary>
  )
}

export default RouterComp

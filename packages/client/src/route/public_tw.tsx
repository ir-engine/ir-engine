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
import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import ErrorBoundary from '@etherealengine/client-core/src/common/components/ErrorBoundary'
import { useCustomRoutes } from '@etherealengine/client-core/src/common/services/RouterService'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import $404 from '../pages/404'
import $503 from '../pages/503'

const $custom = lazy(() => import('@etherealengine/client/src/route/customRoutes'))

export const CenteredLoadingCircle = ({ message }: { message: string }) => {
  return (
    <div className="absolute w-screen h-screen flex justify-center items-center">
      <LoadingCircle className={`block w-12 h-12`} message={message} />
    </div>
  )
}

function PublicRouter() {
  const customRoutes = useCustomRoutes()
  const isLoggedIn = useHookstate(getMutableState(AuthState).isLoggedIn)

  if (!/auth\/oauth/.test(location.pathname) && (!customRoutes.length || !isLoggedIn.value)) {
    return <CenteredLoadingCircle message={t('common:loader.loadingRoutes')} />
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<CenteredLoadingCircle message={t('common:loader.loadingRoutes')} />}>
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

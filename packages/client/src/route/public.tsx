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

import React, { lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'

import ErrorBoundary from '@etherealengine/client-core/src/common/components/ErrorBoundary'
import { useCustomRoutes } from '@etherealengine/client-core/src/common/services/RouterService'
import { LoadingCircle } from '@etherealengine/client-core/src/components/LoadingCircle'

const $index = lazy(() => import('@etherealengine/client/src/pages'))
const $offline = lazy(() => import('@etherealengine/client/src/pages/offline/offline'))
const $admin = lazy(() => import('@etherealengine/client-core/src/admin/adminRoutes'))
const $studio = lazy(() => import('@etherealengine/client/src/pages/editor/editor'))
const $location = lazy(() => import('@etherealengine/client/src/pages/location/location'))

/** @deprecated see https://github.com/EtherealEngine/etherealengine/issues/6485 */
function RouterComp({ route }: { route: string }) {
  const customRoutes = useCustomRoutes()
  const { t } = useTranslation()

  // still allow admin even if no custom routes are loaded in case routes fail to load
  if (route !== 'admin' && !customRoutes.length) {
    return <LoadingCircle message={t('common:loader.loadingRoutes')} />
  }

  const loadProjectComponent = (route: string) => {
    const customRoute = customRoutes.find((customRoute) => customRoute.route === route)
    if (!customRoute) return null
    const Element = customRoute.component
    return <Element {...customRoute.props} />
  }

  let RouteElement

  switch (route) {
    case 'index':
      RouteElement = loadProjectComponent('/') || <$index />
      break
    case 'offline':
      RouteElement = loadProjectComponent('/offline') || <$offline />
      break
    case 'studio':
      RouteElement = loadProjectComponent('/studio') || <$studio />
      break
    case 'location':
      RouteElement = loadProjectComponent('/location') || <$location />
      break
    case 'admin':
      RouteElement = loadProjectComponent('/admin') || <$admin />
      break
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingCircle message={t('common:loader.loadingRoute')} />}>{RouteElement}</Suspense>
    </ErrorBoundary>
  )
}

export default RouterComp

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

import i18n from 'i18next'
import { lazy } from 'react'

import { ROUTE_PAGE_LIMIT } from '@etherealengine/client-core/src/admin/services/RouteService'
import { API } from '@etherealengine/client-core/src/API'
import { routePath } from '@etherealengine/engine/src/schemas/route/route.schema'
import { loadRoute } from '@etherealengine/projects/loadRoute'

export type CustomRoute = {
  route: string
  component: ReturnType<typeof lazy>
  props: any
}

/**
 * getCustomRoutes used to get the routes created by the user.
 *
 * @return {Promise}
 */
export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  const routes = await API.instance.client.service(routePath).find({
    query: {
      $limit: ROUTE_PAGE_LIMIT
    }
  })

  const elements: CustomRoute[] = []

  if (!Array.isArray(routes.data) || routes.data == null) {
    throw new Error(i18n.t('editor:errors.fetchingRouteError', { error: i18n.t('editor:errors.unknownError') }))
  } else {
    for (const project of routes.data) {
      const routeLazyLoad = await loadRoute(project.project, project.route)
      if (routeLazyLoad)
        elements.push({
          route: project.route,
          ...routeLazyLoad
        })
    }
  }

  return elements.filter((c) => !!c)
}

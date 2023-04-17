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

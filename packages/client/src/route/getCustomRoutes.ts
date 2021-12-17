import i18n from 'i18next'
import { loadRoute } from '@xrengine/projects/loadRoute'
import { client } from '@xrengine/client-core/src/feathers'
import { lazy } from 'react'

export type CustomRoute = {
  route: string
  component: ReturnType<typeof lazy>
  props: any
}

/**
 * getCustomRoutes used to get a the routes created by the user.
 *
 * @return {Promise}
 */
export const getCustomRoutes = async (): Promise<CustomRoute[]> => {
  const routes = await client.service('route').find()

  const components: CustomRoute[] = []

  if (!Array.isArray(routes.data) || routes.data == null) {
    throw new Error(
      i18n.t('editor:errors.fetchingRouteError', { error: routes.error || i18n.t('editor:errors.unknownError') })
    )
  } else {
    for (const project of routes.data) {
      const routeLazyLoad = await loadRoute(project.project, project.route)
      if (routeLazyLoad)
        components.push({
          route: project.route,
          ...routeLazyLoad
        })
    }
  }

  return components.filter((c) => !!c)
}

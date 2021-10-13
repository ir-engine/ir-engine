import i18n from 'i18next'
import { Config } from '@xrengine/common/src/config'
import { getToken } from '@xrengine/engine/src/scene/functions/getToken'
import { loadRoute } from '@xrengine/projects/loadRoute'

const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * getCustomRoutes used to get a the routes created by the user.
 *
 * @return {Promise}
 */
export const getCustomRoutes = async (): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const response = await fetch(`${serverURL}/route`, { headers })

  const json = await response.json().catch((err) => {
    console.log('Error fetching JSON')
    console.log(err)
  })

  const components: any[] = []

  if (!Array.isArray(json.data) || json.data == null) {
    throw new Error(
      i18n.t('editor:errors.fetchingRouteError', { error: json.error || i18n.t('editor:errors.unknownError') })
    )
  } else {
    for (const project of json.data) {
      const pages = await loadRoute({
        project: project.project,
        routes: project.routes.split(',')
      })
      components.push(...pages)
    }
  }

  return components
}

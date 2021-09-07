import i18n from 'i18next'
import { fetchUrl } from './fetchUrl'
import { getToken } from './getToken'
import { Config } from '@xrengine/common/src/config'

const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * deleteProjectAsset used to delete asset for specific project.
 *
 * @author Robert Long
 * @param  {any}  projectId
 * @param  {any}  assetId
 * @return {Promise}               [true if deleted successfully else throw error]
 */

export const deleteProjectAsset = async (projectId, assetId): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`
  }

  const projectAssetEndpoint = `${serverURL}/project/${projectId}/assets/${assetId}`

  const resp = await fetchUrl(projectAssetEndpoint, { method: 'DELETE', headers })
  console.log('Response: ' + Object.values(resp))

  if (resp.status === 401) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.projectAssetDeletionFail', { reason: await resp.text() }))
  }

  return true
}

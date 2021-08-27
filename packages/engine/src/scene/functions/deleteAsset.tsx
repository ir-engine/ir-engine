import i18n from 'i18next'
import { fetchUrl } from '@xrengine/engine/src/scene/functions/fetchUrl'
import { getToken } from './getToken'
import { Config } from '@xrengine/common/src/config'

const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * deleteAsset used to delete existing asset using assetId.
 *
 * @author Robert Long
 * @param  {any}  assetId
 * @return {Promise}               [true if deleted successfully else throw error]
 */

export const deleteAsset = async (assetId, projectid?, fileidentifier?): Promise<any> => {
  const token = getToken()

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
    assetId: assetId
  }
  if (projectid) headers['projectid'] = projectid

  if (fileidentifier) headers['fileidentifier'] = fileidentifier

  const assetEndpoint = `${serverURL}/static-resource/${assetId}`

  const resp = await fetchUrl(assetEndpoint, { method: 'DELETE', headers })
  console.log('Response: ' + Object.values(resp))

  if (resp.status === 401) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  if (resp.status !== 200) {
    throw new Error(i18n.t('editor:errors.assetDeletionFail', { reason: await resp.text() }))
  }

  return true
}

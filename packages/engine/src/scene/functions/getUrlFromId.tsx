import { fetchUrl } from './fetchUrl'
import { Config } from '@xrengine/common/src/config'
export const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * getUrlFromId is used to get url of the static resource from its ID
 * @author Abhishek Pathak
 * @param {any} contentID
 * @returns {Promise}
 */

export const getUrlFromId = async (contentID): Promise<any> => {
  const response = await fetchUrl(`${serverURL}/static-resource-url/${contentID}`)
  if (response.ok) {
    return response.json()
  }
  throw new Error("Can't get URL from id")
}

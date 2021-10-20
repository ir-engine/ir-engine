import { Config } from '@xrengine/common/src/config'
import { RethrownError } from '@xrengine/client-core/src/util/errors'
import i18n from 'i18next'
import { fetchContentType } from './fetchContentType'
import { guessContentType } from './guessContentType'

const serverURL = Config.publicRuntimeConfig.apiServer
export const resolveMediaCache = new Map()

/**
 * resolveMedia provides url absoluteUrl and contentType.
 *
 * @author Robert Long
 * @param  {any}  url
 * @param  {any}  index
 * @return {Promise}
 */

export const resolveMedia = async (url, index?): Promise<any> => {
  url = new URL(url, (window as any).location).href

  if (url.startsWith(serverURL)) {
    return { url: url }
  }

  // createing cacheKey for absoluteUrl
  const cacheKey = `${url}|${index}`
  // if cacheKey already exist in media cache then return the response from cache.
  if (resolveMediaCache.has(cacheKey)) return resolveMediaCache.get(cacheKey)

  const request = (async () => {
    let contentType

    // getting contentType, url using absoluteUrl.
    try {
      contentType = guessContentType(url) || (await fetchContentType(url))
    } catch (error) {
      throw new RethrownError(i18n.t('editor:errors.resolveURL', { url: url }), error)
    }

    return { url, contentType }
  })()
  // setting cache key for data containing url, contentType
  resolveMediaCache.set(cacheKey, request)

  return request
}

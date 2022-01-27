import { getContentType } from '@xrengine/common/src/utils/getContentType'

export const resolveMediaCache = new Map()

/**
 * resolveMedia provides url absoluteUrl and contentType.
 *
 * @author Robert Long
 * @param  {any}  url
 * @param  {any}  index
 * @return {Promise}
 */

export const resolveMedia = async (
  url: string,
  index?: number
): Promise<{ url: string; contentType?: string | null }> => {
  url = new URL(url, window.location.origin).href

  // createing cacheKey for absoluteUrl
  const cacheKey = `${url}|${index}`
  if (resolveMediaCache.has(cacheKey)) return resolveMediaCache.get(cacheKey)

  const request = (async () => {
    let contentType: string | null

    try {
      contentType = await getContentType(url)
    } catch (error) {
      console.error(error)
      contentType = ''
    }

    return { url, contentType }
  })()

  // setting cache key for data containing url, contentType
  resolveMediaCache.set(cacheKey, request)

  return request
}

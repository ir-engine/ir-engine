import { fetchContentType } from './fetchContentType'
import { guessContentType } from './guessContentType'

/**
 *  getContentType is used to get content type url.
 * @param  {any}  contentUrl
 * @return {Promise}
 */
export const getContentType = async (contentUrl: string): Promise<string | null> => {
  try {
    return guessContentType(contentUrl) || (await fetchContentType(contentUrl))
  } catch (_) {
    return ''
  }
}

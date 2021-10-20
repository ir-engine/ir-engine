import { fetchContentType } from '@xrengine/editor/src/functions/fetchContentType'
import { guessContentType } from '@xrengine/editor/src/functions/guessContentType'

/**
 *  getContentType is used to get content type url.
 * @author Abhishek Pathak
 * @param  {any}  contentUrl
 * @return {Promise}
 */
export const getContentType = async (contentUrl): Promise<any> => {
  return guessContentType(contentUrl) || (await fetchContentType(contentUrl))
}

import { fetchContentType } from './fetchContentType'
import { guessContentType } from './guessContentType'

/**
 *  getContentType is used to get content type url.
 * @author Abhishek Pathak
 * @param  {any}  contentUrl
 * @return {Promise}
 */
export const getContentType = async (contentUrl): Promise<any> => {
  return guessContentType(contentUrl) || (await fetchContentType(contentUrl))
}

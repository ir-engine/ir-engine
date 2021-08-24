import { fetchUrl } from './fetchUrl'

/**
 * fetchContentType is used to get the header content type of response using url.
 *
 * @author Robert Long
 * @param  {[type]}  url [ url to make the request]
 * @return {Promise}               [wait for the response and return response]
 */

export const fetchContentType = async (url): Promise<any> => {
  const f = await fetchUrl(url, { method: 'HEAD' }).then((r) => r.headers.get('content-type'))
  console.log('Response: ' + Object.values(f))

  return f
}

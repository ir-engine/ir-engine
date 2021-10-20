/**
 * fetchContentType is used to get the header content type of response using url.
 *
 * @author Robert Long
 * @author Abhishek Pathak
 * @param  {[type]}  url [ url to make the request]
 * @return {Promise}               [wait for the response and return response]
 */

export const fetchContentType = async (url): Promise<any> => {
  const f = await fetch(url, { method: 'HEAD' }).then((r) => r.headers.get('content-type'))
  return f
}

/**
 * fetchContentType is used to get the header content type of response using url.
 *
 * @param  {[type]}  url [ url to make the request]
 * @return {Promise}               [wait for the response and return response]
 */

export const fetchContentType = (url: string): Promise<string | null> => {
  return fetch(url, { method: 'HEAD' }).then((r) => r.headers.get('content-type'))
}

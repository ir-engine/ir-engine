import i18n from 'i18next'
import { fetchUrl } from './fetchUrl'
import { getAccountId } from './getAccountId'
import { getToken } from './getToken'
import { scaledThumbnailUrlFor } from './scaledThumbnailUrlFor'
import { Config } from '@xrengine/common/src/config'
export const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * searchMedia function to search media on the basis of provided params.
 *
 * @author Robert Long
 * @param  {any}  source
 * @param  {any}  params
 * @param  {any}  cursor
 * @param  {any}  signal
 * @return {Promise}        [result , nextCursor, suggestions]
 */

export const searchMedia = async (source, params, cursor, signal): Promise<any> => {
  const url = new URL(`${serverURL}/media-search`)

  const headers: any = {
    'content-type': 'application/json'
  }

  const searchParams = url.searchParams

  searchParams.set('source', source)

  if (source === 'assets') {
    searchParams.set('user', getAccountId())
    const token = getToken()
    headers.authorization = `Bearer ${token}`
  }

  if (params.type) {
    searchParams.set('type', params.type)
  }

  if (params.query) {
    //checking BLOCK_SEARCH_TERMSsearchParams.set("q", params.query);
  }

  if (params.filter) {
    searchParams.set('filter', params.filter)
  }

  if (params.collection) {
    searchParams.set('collection', params.collection)
  }

  if (cursor) {
    searchParams.set('cursor', cursor)
  }

  console.log('Fetching...')
  const resp = await fetchUrl(url, { headers, signal })
  console.log('Response: ' + Object.values(resp))

  if (signal.aborted) {
    const error = new Error(i18n.t('editor:errors.mediaSearchAborted')) as any
    error['aborted'] = true
    throw error
  }

  const json = await resp.json()

  if (signal.aborted) {
    const error = new Error(i18n.t('editor:errors.mediaSearchAborted')) as any
    error['aborted'] = true
    throw error
  }

  const thumbnailedEntries =
    json &&
    json.entries &&
    json.entries.length > 0 &&
    json.entries.map((entry) => {
      if (entry.images && entry.images.preview && entry.images.preview.url) {
        entry.images.preview.url = scaledThumbnailUrlFor(entry.images.preview.url, 200, 200)
      }
      return entry
    })

  return {
    results: thumbnailedEntries ? thumbnailedEntries : [],
    suggestions: json.suggestions,
    nextCursor: json.meta?.next_cursor
  }
}

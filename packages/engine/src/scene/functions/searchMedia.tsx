import i18n from 'i18next'
import { fetchUrl } from './fetchUrl'
import { getAccountId } from './getAccountId'
import { getToken } from './getToken'
import { scaledThumbnailUrlFor } from './scaledThumbnailUrlFor'
import { Config } from '@xrengine/common/src/config'

const serverURL = Config.publicRuntimeConfig.apiServer

/**
 * searchMedia function to search media on the basis of provided params.
 *
 * @author Robert Long
 * @author Abhishek Pathak
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

  const paramsOption = { query: {} }
  searchParams.set('source', source)
  paramsOption.query['source'] = source

  if (source === 'assets') {
    searchParams.set('user', getAccountId())
    paramsOption.query['user'] = getAccountId()
    const token = getToken()
    headers.authorization = `Bearer ${token}`
  }

  if (params.type) {
    searchParams.set('type', params.type)
    paramsOption.query['type'] = params.type
  }

  if (params.query) {
    //checking BLOCK_SEARCH_TERMSsearchParams.set("q", params.query);
  }

  if (params.filter) {
    searchParams.set('filter', params.filter)
    paramsOption.query['type'] = params.type
  }

  if (params.collection) {
    searchParams.set('collection', params.collection)
    paramsOption.query['collection'] = params.collection
  }

  if (cursor) {
    searchParams.set('cursor', cursor)
    paramsOption.query['cursor'] = cursor
  }

  console.log('Fetching...')

  const media = globalThis.Editor.clientApp.service('media-search')
  const json = await media.find(paramsOption, {
    headers: { 'content-type': 'application/json', authorization: `Bearer ${getToken()}` }
  })
  ///
  console.log('Response: ' + Object.values(json))

  if (signal.aborted) {
    const error = new Error(i18n.t('editor:errors.mediaSearchAborted')) as any
    error['aborted'] = true
    throw error
  }

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
    results: json?.projects || [],
    suggestions: json.suggestions,
    nextCursor: json.meta?.next_cursor
  }
}

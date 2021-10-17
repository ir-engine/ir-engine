import i18n from 'i18next'
import { getAccountId } from './getAccountId'
import { ProjectManager } from '../managers/ProjectManager'

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
  const paramsOption = { query: {} }
  paramsOption.query['source'] = source

  if (source === 'assets') {
    paramsOption.query['user'] = getAccountId()
  }

  if (params.type) {
    paramsOption.query['type'] = params.type
  }

  if (params.query) {
    //checking BLOCK_SEARCH_TERMSsearchParams.set("q", params.query);
  }

  if (params.filter) {
    paramsOption.query['type'] = params.type
  }

  if (params.collection) {
    paramsOption.query['collection'] = params.collection
  }

  if (cursor) {
    paramsOption.query['cursor'] = cursor
  }

  const service = ProjectManager.instance.feathersClient.service('media-search') as any
  const json = await service.find(paramsOption, {
    headers: {
      'content-type': 'application/json'
    }
  })

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

  return {
    results: json?.projects || [],
    suggestions: json.suggestions,
    nextCursor: json.meta?.next_cursor
  }
}

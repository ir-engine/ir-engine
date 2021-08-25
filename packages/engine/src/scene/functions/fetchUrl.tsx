import { RethrownError } from '@xrengine/engine/src/scene/functions/errors'
import i18n from 'i18next'
import { getToken } from './getToken'

/**
 * fetchUrl used as common api handler.
 *
 * @author Robert Long
 * @param  {any}  url
 * @param  {any}  options [contains request options]
 * @return {Promise}         [response from api]
 */

export const fetchUrl = async (url, options: any = {}): Promise<any> => {
  const token = getToken()
  if (options.headers == null) {
    options.headers = {}
  }
  options.headers.authorization = `Bearer ${token}`
  console.log(url)
  console.log(options)
  const res = await fetch(url, options).catch((error) => {
    console.log(error)
    if (error.message === 'Failed to fetch') {
      error.message += ' (' + i18n.t('editor:errors.CORS') + ')'
    }
    throw new RethrownError(i18n.t('editor:errors.urlFetchError', { url }), error)
  })
  if (res.ok) {
    return res
  }

  const err = new Error(
    i18n.t('editor:errors.networkError', {
      status: res.status || i18n.t('editor:errors.unknownStatus'),
      text: res.statusText || i18n.t('editor:errors.unknownError') + ' - ' + i18n.t('editor:errors.CORS')
    })
  )
  err['response'] = res
  throw err
}

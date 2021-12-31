import i18n from 'i18next'
import { Config } from '@xrengine/common/src/config'

/**
 * getToken used to get the token of logined user.
 *
 * @author Robert Long
 * @return {string}        [returns token string]
 */

export const getToken = (): string => {
  const token = localStorage.getItem(`https://${globalThis.process.env['VITE_FEATHERS_STORE_KEY']}`)

  if (token == null || token.length === 0) {
    throw new Error(i18n.t('editor:errors.notAuthenticated'))
  }

  return token
}

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { getI18nConfigs as getClientCoreI18nConfigs } from '@xrengine/client-core/src/i18n'
import { setRuntime } from '@xrengine/common/src/config'
import translation from '../i18n/en/translation.json'

/**
 * this is required to be here to make some dependencies happy
 */

if (typeof globalThis.process === 'undefined') {
  ;(globalThis as any).process = { env: {} }
}

export const initialize = (): Promise<void> => {
  return new Promise((resolve) => {
    // Set Runtime config to client core
    if (process.env['VITE_LOCAL_BUILD'] === 'true') {
      console.log('local build!', process.env)
      setRuntime({
        gameserverHost: `${process.env.VITE_GAMESERVER_HOST}`,
        gameserverPort: `${process.env.VITE_GAMESERVER_PORT}`,
        apiServer: `https://${process.env.VITE_SERVER_HOST}:${process.env.VITE_SERVER_PORT}`,
        gameserver: `https://${process.env.VITE_GAMESERVER_HOST}:${process.env.VITE_GAMESERVER_PORT}`,
        mediatorServer: `${process.env.VITE_MEDIATOR_SERVER}`
      })
    } else {
      setRuntime(
        process.env.APP_ENV === 'development'
          ? process.env.publicRuntimeConfig
          : (window as any).env.publicRuntimeConfig
      )
    }
    delete process.env.publicRuntimeConfig

    // Setup I18N
    const resources = {
      en: {
        translation
      }
    }

    const namespace = ['translation']

    const subPackageTranslations = [getClientCoreI18nConfigs()]

    for (let t of subPackageTranslations) {
      for (let key of Object.keys(t.resources)) {
        if (!resources[key]) resources[key] = t.resources[key]
        else resources[key] = { ...resources[key], ...t.resources[key] }
      }

      for (let ns of t.namespace) {
        if (!namespace.includes(ns)) namespace.push(ns)
      }
    }

    i18n.use(LanguageDetector).use(initReactI18next).init({
      fallbackLng: 'en',
      ns: namespace,
      defaultNS: 'translation',
      lng: 'en',
      resources
    })

    resolve()
  })
}

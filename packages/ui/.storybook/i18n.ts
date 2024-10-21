import getClientCoreI18nConfigs from '@ir-engine/client-core/src/i18n'
import { getI18nConfigs } from '@ir-engine/client-core/src/i18nImporter'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { merge } from 'lodash'
import { initReactI18next } from 'react-i18next'

// @ts-ignore
const clientI18nConfigs = import.meta.glob('../../client-core/i18n/**/*.json', { eager: true })

const modules = merge(clientI18nConfigs, getClientCoreI18nConfigs())

const { namespace, resources } = getI18nConfigs(modules)

i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: 'en',
  ns: namespace,
  defaultNS: 'translation',
  lng: 'en',
  resources
})

export default i18n

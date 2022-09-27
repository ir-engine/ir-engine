import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { merge } from 'lodash'
import { initReactI18next } from 'react-i18next'

import getClientCoreI18nConfigs from '@xrengine/client-core/src/i18n'
import { getI18nConfigs } from '@xrengine/client-core/src/i18nImporter'

//@ts-ignore
const projects = import.meta.glob('../../projects/projects/**/i18n/**/*.json', { eager: true })
//@ts-ignore
const clientI18nConfigs = import.meta.glob('../i18n/**/*.json', { eager: true })

export const initializei18n = () => {
  const modules = merge(clientI18nConfigs, getClientCoreI18nConfigs(), projects)

  const { namespace, resources } = getI18nConfigs(modules)

  i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    ns: namespace,
    defaultNS: 'translation',
    lng: 'en',
    resources
  })
}

// TODO: support typed translations
// declare module 'react-i18next' {
//   // and extend them!
//   interface CustomTypeOptions {
//     // custom namespace type if you changed it
//     defaultNS: 'en';
//     // custom resources type
//     resources: ReturnType<typeof getI18nConfigs>['resources'];
//   }
// }

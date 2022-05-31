import { merge } from 'lodash'

// @ts-ignore
const resources = Object.entries(import.meta.globEager('../i18n/**/*.json')).reduce((obj, [key, translation]) => {
  const [language, namespace] = key.replace('../i18n/', '').replace('.json', '').split('/')
  const result = { [language]: { [namespace]: translation } }
  return merge(result, obj)
}, {} as any)

export const getI18nConfigs = () => {
  return {
    resources,
    namespace: Object.keys(resources['en'])
  }
}

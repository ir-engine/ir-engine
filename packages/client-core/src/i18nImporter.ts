import { merge } from 'lodash'

export const getI18nConfigs = (modules: { [module: string]: any }) => {
  if (!Object.keys(modules).length) return {}
  const resources = Object.entries(modules).reduce((obj, [key, translation]) => {
    const [language, namespace] = key
      .slice(key.indexOf('/i18n/') + 6)
      .replace('.json', '')
      .split('/')
    const result = { [language]: { [namespace]: translation } }
    return merge(result, obj)
  }, {} as any)
  return {
    resources,
    namespace: Object.keys(resources['en'])
  }
}

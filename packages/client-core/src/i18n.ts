import admin from '../i18n/en/admin.json'
import common from '../i18n/en/common.json'
import editor from '../i18n/en/editor.json'
import social from '../i18n/en/social.json'
import user from '../i18n/en/user.json'

export const getI18nConfigs = () => {
  return {
    resources: {
      en: {
        editor,
        user,
        admin,
        social,
        common
      }
    },
    namespace: ['editor', 'user', 'admin', 'social', 'common']
  }
}

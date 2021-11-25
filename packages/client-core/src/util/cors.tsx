import i18n from 'i18next'
import { Config } from '@xrengine/common/src/config'

export const corsAnywhereUrl = (string: any): string => {
  return `${Config.publicRuntimeConfig.corsServer}/${url}`
}

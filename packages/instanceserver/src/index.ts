import { updateAppConfig } from '@xrengine/server-core/src/updateAppConfig'

require('fix-esm').register()
const init = async () => {
  await updateAppConfig()
  const { start } = await import('./start')
  start()
}
init()

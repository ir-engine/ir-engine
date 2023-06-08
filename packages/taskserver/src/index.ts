import { updateAppConfig } from '@etherealengine/server-core/src/updateAppConfig'

import start from './start'

const init = async () => {
  await updateAppConfig()
  await start()
}
init()

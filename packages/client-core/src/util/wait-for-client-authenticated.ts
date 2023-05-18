import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'

import { FeathersClient } from '../API'

async function waitForClientAuthenticated(): Promise<void> {
  const api = Engine.instance.api as FeathersClient
  console.log('Client authenticated?', api.authentication?.authenticated)
  if (api.authentication?.authenticated === true) return
  else
    return await new Promise((resolve) =>
      setTimeout(async () => {
        await waitForClientAuthenticated()
        resolve()
      }, 100)
    )
}

export default waitForClientAuthenticated

import { applyIncomingActions } from '@xrengine/hyperflux'

export default async function IncomingActionSystem(world) {
  return () => {
    applyIncomingActions(world.store)
  }
}

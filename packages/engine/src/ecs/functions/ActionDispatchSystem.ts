import ActionFunctions from '@xrengine/hyperflux/functions/ActionFunctions'

export default async function ActionDispatchSystem(world) {
  return () => {
    ActionFunctions.applyIncomingActions(world.store, Date.now())
  }
}

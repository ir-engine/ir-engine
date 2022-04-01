import ActionFunctions from 'src/hyperflux/functions/ActionFunctions'

export default async function ActionDispatchSystem() {
  return () => {
    ActionFunctions.applyIncomingActions()
  }
}

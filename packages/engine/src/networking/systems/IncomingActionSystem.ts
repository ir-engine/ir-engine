import { applyIncomingActions } from '@etherealengine/hyperflux'

export default function IncomingActionSystem() {
  const execute = () => {
    applyIncomingActions()
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

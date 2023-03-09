import { Engine } from '../ecs/classes/Engine'
import { applyAutopilotInput } from './functions/moveAvatar'

export default async function AvatarAutopilotSystem() {
  const execute = () => {
    applyAutopilotInput(Engine.instance.localClientEntity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

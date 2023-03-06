import { World } from '../ecs/classes/World'
import { applyAutopilotInput, applyGamepadInput } from './functions/moveAvatar'

export default async function AvatarAutopilotSystem(world: World) {
  const execute = () => {
    applyAutopilotInput(world.localClientEntity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

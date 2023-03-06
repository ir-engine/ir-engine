import { World } from '../ecs/classes/World'
import { applyAutopilotInput, applyGamepadInput } from './functions/moveAvatar'

export default async function AvatarMovementSystem(world: World) {
  const execute = () => {
    applyGamepadInput(world.localClientEntity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

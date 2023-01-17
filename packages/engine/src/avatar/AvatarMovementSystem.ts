import { World } from '../ecs/classes/World'
import { applyGamepadInput } from './functions/moveAvatar'

export default async function AvatarMovementSystem(world: World) {
  const execute = () => {
    applyGamepadInput(world.localClientEntity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

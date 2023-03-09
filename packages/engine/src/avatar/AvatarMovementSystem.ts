import { Engine } from '../ecs/classes/Engine'
import { applyGamepadInput } from './functions/moveAvatar'

export default async function AvatarMovementSystem() {
  const execute = () => {
    applyGamepadInput(Engine.instance.localClientEntity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

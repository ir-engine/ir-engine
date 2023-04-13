import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { applyGamepadInput } from './functions/moveAvatar'

const execute = () => {
  applyGamepadInput(Engine.instance.localClientEntity)
}

export const AvatarMovementSystem = defineSystem({
  uuid: 'ee.engine.AvatarMovementSystem',
  execute
})

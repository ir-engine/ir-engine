import { Engine } from '../ecs/classes/Engine'
import { defineSystem, PresentationSystemGroup } from '../ecs/functions/SystemFunctions'
import { applyAutopilotInput } from './functions/moveAvatar'

const execute = () => {
  applyAutopilotInput(Engine.instance.localClientEntity)
}

export const AvatarAutopilotSystem = defineSystem(
  {
    uuid: 'ee.engine.AvatarAutopilotSystem',
    execute
  },
  { after: [PresentationSystemGroup] }
)

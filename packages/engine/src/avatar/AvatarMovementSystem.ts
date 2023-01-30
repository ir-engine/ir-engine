import { Engine } from 'behave-graph'
import { Vector3 } from 'three'

import { createActionQueue, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { applyAutopilotInput, applyGamepadInput } from './functions/moveAvatar'

export default async function AvatarMovementSystem(world: World) {
  const execute = () => {
    applyGamepadInput(world.localClientEntity)
    applyAutopilotInput(world.localClientEntity)
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

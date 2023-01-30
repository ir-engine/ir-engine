import { Engine } from 'behave-graph'
import { Vector3 } from 'three'

import { createActionQueue, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../ecs/classes/EngineState'
import { World } from '../ecs/classes/World'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { applyAutopilotInput, applyGamepadInput, autopilotGetPosition } from './functions/moveAvatar'

let walkPoint = new Vector3() as Vector3 | undefined

export default async function AvatarMovementSystem(world: World) {
  const tapToMove = () => {
    walkPoint = autopilotGetPosition(world.localClientEntity)
  }

  //doing click/touch detection here because doing so via engine actions only returned the first action
  const canvas = EngineRenderer.instance.renderer.domElement
  canvas.addEventListener('auxclick', tapToMove)
  canvas.addEventListener('click', tapToMove)
  canvas.addEventListener('touchend', tapToMove)

  const execute = () => {
    applyGamepadInput(world.localClientEntity)

    if (walkPoint) applyAutopilotInput(world.localClientEntity, walkPoint)
  }

  const cleanup = async () => {
    canvas.removeEventListener('auxclick', tapToMove)
    canvas.removeEventListener('click', tapToMove)
    canvas.removeEventListener('touchend', tapToMove)
  }

  return { execute, cleanup }
}

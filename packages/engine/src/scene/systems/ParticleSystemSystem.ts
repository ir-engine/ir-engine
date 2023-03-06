import { BatchedParticleRenderer } from 'three.quarks'

import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'

let batchRenderer: BatchedParticleRenderer | null

export function getBatchRenderer() {
  return batchRenderer
}

export default async function ParticleSystem() {
  batchRenderer = new BatchedParticleRenderer()
  const sceneLoadListener = createActionQueue(EngineActions.sceneLoaded.matches)
  function execute() {
    for (const action of sceneLoadListener()) {
      batchRenderer!.parent === null && Engine.instance.scene.add(batchRenderer!)
    }

    batchRenderer && batchRenderer.update(Engine.instance.deltaSeconds)
  }

  async function cleanup() {
    removeActionQueue(sceneLoadListener)
    batchRenderer!.parent !== null && Engine.instance.scene.remove(batchRenderer!)
    batchRenderer = null
  }

  return { execute, cleanup }
}

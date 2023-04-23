import { useEffect } from 'react'
import { BatchedParticleRenderer } from 'three.quarks'

import { defineActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { defineSystem } from '../../ecs/functions/SystemFunctions'

const batchRenderer = new BatchedParticleRenderer()

export function getBatchRenderer() {
  return batchRenderer
}

const sceneLoadListener = defineActionQueue(EngineActions.sceneLoaded.matches)

const execute = () => {
  for (const action of sceneLoadListener()) {
    batchRenderer!.parent === null && Engine.instance.scene.add(batchRenderer!)
  }

  batchRenderer && batchRenderer.update(Engine.instance.deltaSeconds)
}

const reactor = () => {
  useEffect(() => {
    return () => {
      removeActionQueue(sceneLoadListener)
      batchRenderer!.parent !== null && Engine.instance.scene.remove(batchRenderer!)
    }
  }, [])
  return null
}

export const ParticleSystem = defineSystem({
  uuid: 'ee.engine.ParticleSystem',
  execute,
  reactor
})

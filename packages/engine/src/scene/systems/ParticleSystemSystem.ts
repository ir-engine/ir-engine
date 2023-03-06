import { BatchedParticleRenderer } from 'three.quarks'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  createActionQueue,
  defineAction,
  defineState,
  dispatchAction,
  getState,
  NO_PROXY,
  removeActionQueue
} from '@etherealengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GroupComponent, removeGroupComponent } from '../components/GroupComponent'
import { ParticleSystemComponent } from '../components/ParticleSystemComponent'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

let batchRenderer: BatchedParticleRenderer | null

export function getBatchRenderer() {
  return batchRenderer
}

export default async function ParticleSystem(world: World) {
  batchRenderer = new BatchedParticleRenderer()
  const sceneLoadListener = createActionQueue(EngineActions.sceneLoaded.matches)
  function execute() {
    for (const action of sceneLoadListener()) {
      batchRenderer!.parent === null && world.scene.add(batchRenderer!)
    }

    batchRenderer && batchRenderer.update(world.deltaSeconds)
  }

  async function cleanup() {
    removeActionQueue(sceneLoadListener)
    batchRenderer!.parent !== null && world.scene.remove(batchRenderer!)
    batchRenderer = null
  }

  return { execute, cleanup }
}

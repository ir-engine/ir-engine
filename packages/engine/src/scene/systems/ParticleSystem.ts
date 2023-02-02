import { BatchedParticleRenderer } from 'three.quarks'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { createActionQueue, defineAction, defineState, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GroupComponent, removeGroupComponent } from '../components/GroupComponent'
import { ParticleEmitterComponent } from '../components/ParticleSystemComponent'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

export type ParticleSystemStateType = {
  batchSystem: BatchedParticleRenderer
}

export const ParticleSystemState = defineState({
  name: 'ParticleSystemState',
  initial: {
    batchSystem: new BatchedParticleRenderer()
  } as ParticleSystemStateType
})

export default async function ParticleSystem(world: World) {
  function execute() {}

  async function cleanup() {}

  return { execute, cleanup }
}

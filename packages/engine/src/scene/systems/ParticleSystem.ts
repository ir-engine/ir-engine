import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { createActionQueue, defineAction, dispatchAction, removeActionQueue } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeQuery } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { GroupComponent, removeGroupComponent } from '../components/GroupComponent'
import {
  ParticleEmitterComponent,
  SCENE_COMPONENT_PARTICLE_EMITTER,
  SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES
} from '../components/ParticleEmitterComponent'
import {
  deserializeParticleEmitter,
  initializeParticleSystem,
  serializeParticleEmitter} from '../functions/loaders/ParticleEmitterFunctions'
import { ParticleSystem } from '../functions/particles/ParticleTypes'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

export class ParticleSystemActions {
  static destroyParticleSystem = defineAction({
    type: 'xre.scene.ParticleSystem.PARTICLE_SYSTEM_DISPOSE' as const,
    entity: matches.any as Validator<unknown, Entity>
  })
  static createParticleSystem = defineAction({
    type: 'xre.scene.ParticleSystem.PARTICLE_SYSTEM_CREATE' as const,
    entity: matches.any as Validator<unknown, Entity>
  })
}

export default async function ParticleSystem(world: World) {
  const systemTable = new Map<Entity, ParticleSystem>()
  const mutices = new Set<Entity>()
  const creatingQueue = createActionQueue(ParticleSystemActions.createParticleSystem.matches)
  const destroyingQueue = createActionQueue(ParticleSystemActions.destroyParticleSystem.matches)

  function dispose(entity, system) {
    system.emitters.map((emitter) => {
      emitter.particles.map((particle) => particle.destroy())
      emitter.destroy()
    })
    system.renderers.map((renderer) => {
      renderer.remove()
    })
    dispatchAction(ParticleSystemActions.destroyParticleSystem({ entity }))
  }

  world.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PARTICLE_EMITTER, props: SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(ParticleEmitterComponent.name, SCENE_COMPONENT_PARTICLE_EMITTER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PARTICLE_EMITTER, {
    defaultData: SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES,
    deserialize: deserializeParticleEmitter,
    serialize: serializeParticleEmitter
  })

  const particleQuery = defineQuery([TransformComponent, ParticleEmitterComponent])
  const particleGroupQuery = defineQuery([TransformComponent, ParticleEmitterComponent, GroupComponent])
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const clearSystem = (entity) => {
    if (mutices.has(entity)) return
    if (systemTable.has(entity)) {
      mutices.add(entity)
      removeGroupComponent(entity)
      dispose(entity, systemTable.get(entity))
    }
  }

  const execute = () => {
    for (const action of creatingQueue()) {
      const entity = action.entity
      if (mutices.has(entity)) continue
      mutices.add(entity)
      if (systemTable.has(entity)) {
        dispose(entity, systemTable.get(entity))
      } else {
        initializeParticleSystem(entity).then((system) => {
          systemTable.set(entity, system!)
          mutices.delete(entity)
        })
      }
    }

    for (const { entity } of destroyingQueue()) {
      if (!mutices.has(entity)) continue
      const system = systemTable.get(entity)
      if (system) system.destroy()
      systemTable.delete(entity)
      mutices.delete(entity)
    }

    particleQuery.exit().map(clearSystem)

    const dt = world.deltaSeconds
    for (const entity of particleGroupQuery()) {
      const group = getComponent(entity, GroupComponent)
      for (const obj of group) obj.updateMatrixWorld(true)
      const system = systemTable.get(entity)
      if (system) system.update(dt)
    }
  }

  const cleanup = async () => {
    removeActionQueue(creatingQueue)
    removeActionQueue(destroyingQueue)

    world.scenePrefabRegistry.delete(ScenePrefabs.particleEmitter)

    world.sceneComponentRegistry.delete(ParticleEmitterComponent.name)
    world.sceneLoadingRegistry.delete(SCENE_COMPONENT_PARTICLE_EMITTER)

    removeQuery(world, particleQuery)
    removeActionQueue(modifyPropertyActionQueue)
  }

  return { execute, cleanup }
}

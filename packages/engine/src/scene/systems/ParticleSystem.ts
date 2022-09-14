import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { createActionQueue, defineAction } from '@xrengine/hyperflux'

import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import {
  ParticleEmitterComponent,
  SCENE_COMPONENT_PARTICLE_EMITTER,
  SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES
} from '../components/ParticleEmitterComponent'
import {
  deserializeParticleEmitter,
  initializeParticleSystem,
  serializeParticleEmitter,
  updateParticleEmitter
} from '../functions/loaders/ParticleEmitterFunctions'
import { defaultSpatialComponents, ScenePrefabs } from './SceneObjectUpdateSystem'

export class ParticleSystemActions {
  static disposeParticleSystem = defineAction({
    type: 'xre.scene.ParticleSystem.PARTICLE_SYSTEM_DISPOSE' as const,
    entity: matches.any as Validator<unknown, Entity>
  })
  static createParticleSystem = defineAction({
    type: 'xre.scene.ParticleSystem.PARTICLE_SYSTEM_CREATE' as const,
    entity: matches.any as Validator<unknown, Entity>
  })
}

export default async function ParticleSystem(world: World) {
  const systemTable = new Map()
  const mutices = new Set<Entity>()
  const creatingQueue = createActionQueue(ParticleSystemActions.createParticleSystem.matches)
  const disposingQueue = createActionQueue(ParticleSystemActions.disposeParticleSystem.matches)

  function dispose(system) {
    system.emitters.map((emitter) => {
      emitter.removeAllParticles()
      emitter.removeAllInitializers()
      emitter.removeAllBehaviours()
    })
    system.renderers.map((renderer) => {
      system.removeRenderer(renderer)
    })
    system.update()
    system.emitters.map((emitter) => {
      emitter.stopEmit()
    })
    return new Promise<void>((resolve) =>
      setTimeout(() => {
        system.destroy()
        resolve()
      }, 0)
    )
  }

  world.scenePrefabRegistry.set(ScenePrefabs.particleEmitter, [
    ...defaultSpatialComponents,
    { name: SCENE_COMPONENT_PARTICLE_EMITTER, props: SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES }
  ])

  world.sceneComponentRegistry.set(ParticleEmitterComponent._name, SCENE_COMPONENT_PARTICLE_EMITTER)
  world.sceneLoadingRegistry.set(SCENE_COMPONENT_PARTICLE_EMITTER, {
    defaultData: SCENE_COMPONENT_PARTICLE_EMITTER_DEFAULT_VALUES,
    deserialize: deserializeParticleEmitter,
    serialize: serializeParticleEmitter
  })

  const particleQuery = defineQuery([Object3DComponent, ParticleEmitterComponent])
  const modifyPropertyActionQueue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  return () => {
    /**
     * Scene Loaders
     */

    for (const action of modifyPropertyActionQueue()) {
      for (const entity of action.entities) {
        if (hasComponent(entity, ParticleEmitterComponent)) updateParticleEmitter(entity)
      }
    }

    for (const entity of particleQuery.enter()) updateParticleEmitter(entity)

    /**
     * Effect handler
     */

    for (const action of disposingQueue()) {
      const entity = action.entity

      if (mutices.has(entity)) continue

      if (systemTable.has(entity)) {
        mutices.add(entity)
        dispose(systemTable.get(entity)).then(() => {
          systemTable.delete(entity)
          mutices.delete(entity)
        })
      }
    }
    for (const action of creatingQueue()) {
      const entity = action.entity

      if (mutices.has(entity)) continue
      mutices.add(entity)
      const disposeOp: Promise<void>[] = []
      if (systemTable.has(entity)) {
        disposeOp.push(
          new Promise<void>((resolve) => {
            dispose(systemTable.get(entity)).then(() => resolve())
          })
        )
      }
      Promise.all(disposeOp)
        .then(() => initializeParticleSystem(entity))
        .then((system) => {
          systemTable.set(entity, system)
          mutices.delete(entity)
        })
    }
  }
}

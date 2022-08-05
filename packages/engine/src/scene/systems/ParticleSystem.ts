import System from 'three-nebula'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { createActionQueue, defineAction } from '@xrengine/hyperflux'

import { Entity } from '../../ecs/classes/Entity'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../components/Object3DComponent'
import { ParticleEmitterComponent } from '../components/ParticleEmitterComponent'
import { initializeParticleSystem } from '../functions/loaders/ParticleEmitterFunctions'

export class ParticleSystemActions {
  static disposeParticleSystem = defineAction({
    type: 'PARTICLE_SYSTEM_DISPOSE' as const,
    entity: matches.any as Validator<unknown, Entity>
  })
  static createParticleSystem = defineAction({
    type: 'PARTICLE_SYSTEM_CREATE' as const,
    entity: matches.any as Validator<unknown, Entity>
  })
}

export default async function ParticleSystem(world: World) {
  const systemTable = new Map()
  const mutices = new Set<Entity>()
  const emitterQuery = defineQuery([ParticleEmitterComponent])
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

  return () => {
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

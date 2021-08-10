import { ParticleEmitterComponent } from '../components/ParticleEmitter'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { applyTransform } from '../functions/particleHelpers'
import { ECSWorld } from '../../ecs/classes/World'
import { defineQuery, defineSystem, System } from '../../ecs/bitecs'

export const ParticleSystem = async (): Promise<System> => {
  const emitterQuery = defineQuery([ParticleEmitterComponent])

  return defineSystem((world: ECSWorld) => {
    const { delta } = world

    for (const entity of emitterQuery(world)) {
      const emitter = getComponent(entity, ParticleEmitterComponent)
      applyTransform(entity, emitter)
      emitter.particleEmitterMesh?.update(delta)
    }

    return world
  })
}

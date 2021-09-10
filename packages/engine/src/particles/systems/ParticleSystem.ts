import { ParticleEmitterComponent } from '../components/ParticleEmitter'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { applyTransform } from '../functions/particleHelpers'
import { World } from '../../ecs/classes/World'
import { System } from '../../ecs/classes/System'

export default async function ParticleSystem(world: World): Promise<System> {
  const emitterQuery = defineQuery([ParticleEmitterComponent])

  return () => {
    const { delta } = world
    for (const entity of emitterQuery(world)) {
      const emitter = getComponent(entity, ParticleEmitterComponent)
      applyTransform(entity, emitter)
      emitter.particleEmitterMesh?.update(delta)
    }
  }
}

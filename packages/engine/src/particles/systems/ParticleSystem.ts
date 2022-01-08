import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { ParticleEmitterComponent } from '../components/ParticleEmitter'
import { applyTransform } from '../functions/particleHelpers'

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

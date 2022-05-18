import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { ParticleEmitterComponent } from '../components/ParticleEmitter'

export default async function ParticleSystem(world: World) {
  const emitterQuery = defineQuery([ParticleEmitterComponent])

  return () => {
    const { deltaSeconds: delta } = world
    for (const entity of emitterQuery(world)) {
      const emitter = getComponent(entity, ParticleEmitterComponent)
      emitter.update(delta)
    }
  }
}

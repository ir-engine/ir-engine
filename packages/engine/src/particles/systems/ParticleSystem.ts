import { ParticleEmitterComponent } from '../components/ParticleEmitter'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { World } from '../../ecs/classes/World'

export default async function ParticleSystem(world: World) {
  const emitterQuery = defineQuery([ParticleEmitterComponent])

  return () => {
    const { delta } = world
    for (const entity of emitterQuery(world)) {
      const emitter = getComponent(entity, ParticleEmitterComponent)
      emitter.update(delta)
    }
  }
}

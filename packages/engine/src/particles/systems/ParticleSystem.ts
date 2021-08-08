import { ParticleEmitterComponent } from '../components/ParticleEmitter'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { applyTransform } from '../functions/particleHelpers'
import { System } from '../../ecs/classes/System'

/** System class for particle system. */
export class ParticleSystem extends System {
  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.emitters.added) {
      const emitter = getComponent(entity, ParticleEmitterComponent)
      this.clearEventQueues()
    }

    for (const entity of this.queryResults.emitters.all) {
      const emitter = getComponent(entity, ParticleEmitterComponent)
      applyTransform(entity, emitter)
      emitter.particleEmitterMesh?.update(deltaTime)
    }

    for (const entity of this.queryResults.emitters.removed) {
    }
  }
}

ParticleSystem.queries = {
  emitters: {
    components: [ParticleEmitterComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}

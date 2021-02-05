import { ParticleEmitter } from "../components/ParticleEmitter";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { registerComponent } from "../../ecs/functions/ComponentFunctions";
import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { applyTransform } from "../functions/particleHelpers";

/** System class for particle system. */
export class ParticleSystem extends System {
  /** Constructs the system. */
  constructor(attributes?: SystemAttributes) {
    super();
    registerComponent(ParticleEmitter);
  }

  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.emitters.added) {
      const emitter = getMutableComponent(entity, ParticleEmitter) as ParticleEmitter;
      this.clearEventQueues();
    }

    this.queryResults.emitters.all?.forEach(entity => {
      const emitter = getMutableComponent(entity, ParticleEmitter) as ParticleEmitter;
      applyTransform(entity, emitter);
      emitter.particleEmitterMesh?.update(deltaTime);
    });

    for (const entity of this.queryResults.emitters.removed) {
    }
  }
}

ParticleSystem.queries = {
  emitters: {
    components: [ParticleEmitter],
    listen: {
      added: true,
      removed: true,
    }
  },
};

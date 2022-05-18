import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ParticleEmitterMesh } from '../functions/ParticleEmitterMesh'

export const ParticleEmitterComponent = createMappedComponent<ParticleEmitterMesh>('ParticleEmitterComponent')

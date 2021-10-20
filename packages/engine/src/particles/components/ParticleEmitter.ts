import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { ParticleEmitterMesh } from '../functions/ParticleEmitterMesh'

export type ParticleEmitterComponentType = {
  particleEmitterMesh: ParticleEmitterMesh
  // particleMesh: Mesh
  // src: string;
  // textureLoading: boolean;

  // particleCount: number;

  // startColor: Color;
  // middleColor: Color;
  // endColor: Color;
  // colorCurve: string;

  // startOpacity: number;
  // middleOpacity: number;
  // endOpacity: number;

  // startSize: number;
  // endSize: number;
  // sizeCurve: string;
  // sizeRandomness: number;

  // lifetime: number;
  // lifetimeRandomness: number;
  // ageRandomness: number;

  // startVelocity: Vector3;
  // endVelocity: Vector3;
  // angularVelocity: number;
  // velocityCurve: string;

  // initialPositions: any[];
  // particleSizeRandomness: any[];
  // ages: any[];
  // initialAges: any[];
  // lifetimes: any[];
  // colors: any[];
}

export const ParticleEmitterComponent = createMappedComponent<ParticleEmitterComponentType>('ParticleEmitterComponent')

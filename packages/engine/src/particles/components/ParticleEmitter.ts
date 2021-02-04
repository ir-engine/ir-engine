import { Types } from "../../ecs//types/Types";
import { Component } from "../../ecs/classes/Component";
import { SystemStateComponent } from "../../ecs/classes/SystemStateComponent";
import { FrameStyle, ParticleEmitterInterface } from "../interfaces";
import { ParticleEmitterMesh } from "../functions/ParticleEmitterMesh";
import { Vector3, Color, Mesh } from 'three';

/** Class component for particle emitter. */
export class ParticleEmitter extends Component<ParticleEmitter> {
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

ParticleEmitter._schema = {
  ...ParticleEmitter._schema,
  particleEmitterMesh: { type: Types.Ref, default: null },
  // particleMesh: { type: Types.Ref, default: new Mesh() },
  // src: { type: Types.String, default: null },

  // particleCount: { type: Types.Number, default: 100 },

  // startColor: { type: Types.Ref, default: new Color() },
  // middleColor: { type: Types.Ref, default: new Color() },
  // endColor: { type: Types.Ref, default: new Color() },
  // colorCurve: { type: Types.String, default: 'linear' },

  // startOpacity: { type: Types.Number, default: 1 },
  // middleOpacity: { type: Types.Number, default: 1 },
  // endOpacity: { type: Types.Number, default: 1 },

  // startSize: { type: Types.Number, default: 0.25 },
  // endSize: { type: Types.Number, default: 0.25 },
  // sizeCurve: { type: Types.String, default: 'linear' },
  // sizeRandomness: { type: Types.Number, default: 0 },

  // ageRandomness: { type: Types.Number, default: 10 },
  // lifetime: { type: Types.Number, default: 5 },
  // lifetimeRandomness: { type: Types.Number, default: 5 },

  // startVelocity: { type: Types.Ref, default: new Vector3(0, 0, 0.5)},
  // endVelocity: { type: Types.Ref, default: new Vector3(0, 0, 0.5)},
  // angularVelocity: { type: Types.String, default: 0 },
  // velocityCurve: { type: Types.String, default: 'linear' },
};

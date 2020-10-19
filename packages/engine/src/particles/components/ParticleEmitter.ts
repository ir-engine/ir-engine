import { Types } from "../../ecs//types/Types";
import { Component } from "../../ecs/classes/Component";
import { SystemStateComponent } from "../../ecs/classes/SystemStateComponent";
import { FrameStyle, ParticleEmitterInterface } from "../interfaces";
interface ParticleEmitterStateInterface {
  emitter3D: any;
  useEntityRotation: boolean;
  syncTransform: boolean;
}

export class ParticleEmitterState extends SystemStateComponent<ParticleEmitterStateInterface> {
  emitter3D: any
  useEntityRotation: boolean
  syncTransform: boolean
}

ParticleEmitterState.schema = {
  ...ParticleEmitterState.schema,
  emitter3D: { type: Types.Ref },
  useEntityRotation: { type: Types.Boolean, default: true },
  syncTransform: { type: Types.Boolean, default: false }
};

export class ParticleEmitter extends Component<ParticleEmitterInterface> {
  particleMesh: any
  enabled: boolean
  count: number
  atlas: string
  textureFrame: any
  frames: any[]
  lifeTime: number
  repeatTime: number
  spawnVariance: number
  burst: number
  syncTransform: boolean
  useEntityRotation: boolean
  worldUp: boolean
  colors: { r: number; g: number; b: number }[]
  orientations: number[]
  scales: number[]
  opacities: number[]
  frameStyle: FrameStyle
  offset: { x: number; y: number; z: number }
  velocity: { x: number; y: number; z: number }
  acceleration: { x: number; y: number; z: number }
  radialVelocity: number
  radialAcceleration: number
  angularVelocity: { x: number; y: number; z: number }
  angularAcceleration: { x: number; y: number; z: number }
  orbitalVelocity: number
  orbitalAcceleration: number
  worldAcceleration: { x: number; y: number; z: number }
  brownianSpeed: number
  brownianScale: number
  seed: number
  velocityScale: number
  velocityScaleMin: number
  velocityScaleMax: number
}

ParticleEmitter.schema = {
  ...ParticleEmitter.schema,
  particleMesh: { type: Types.Ref, default: null },
  enabled: { type: Types.Boolean, default: true },
  count: { type: Types.Number, default: -1 },
  atlas: { type: Types.String, default: "" },
  textureFrame: { type: Types.Ref, default: undefined },
  frames: { type: Types.Array, default: [] },
  lifeTime: { type: Types.Number, default: 1 },
  repeatTime: { type: Types.Number, default: 0 },
  spawnVariance: { type: Types.Number, default: 0 },
  burst: { type: Types.Number, default: 0 },
  syncTransform: { type: Types.Boolean, default: false },
  useEntityRotation: { type: Types.Boolean, default: true },
  worldUp: { type: Types.Boolean, default: false },
  // randomizable values
  colors: { type: Types.Array, default: [{ r: 1, g: 1, b: 1 }] },
  orientations: { type: Types.Array, default: [0] },
  scales: { type: Types.Array, default: [1] },
  opacities: { type: Types.Array, default: [1] },
  frameStyle: { type: Types.String, default: "sequence" },
  offset: { type: Types.Ref, default: { x: 0, y: 0, z: 0 } },
  velocity: { type: Types.Ref, default: { x: 0, y: 0, z: 0 } },
  acceleration: { type: Types.Ref, default: { x: 0, y: 0, z: 0 } },
  radialVelocity: { type: Types.Number, default: 0 },
  radialAcceleration: { type: Types.Number, default: 0 },
  angularVelocity: { type: Types.Ref, default: { x: 0, y: 0, z: 0 } },
  angularAcceleration: { type: Types.Ref, default: { x: 0, y: 0, z: 0 } },
  orbitalVelocity: { type: Types.Number, default: 0 },
  orbitalAcceleration: { type: Types.Number, default: 0 },
  worldAcceleration: { type: Types.Ref, default: { x: 0, y: 0, z: 0 } },
  brownianSpeed: { type: Types.Number, default: 0 },
  brownianScale: { type: Types.Number, default: 0 }
};

import { Types } from "../../ecs//types/Types";
import { Component } from "../../ecs/classes/Component";
import { SystemStateComponent } from "../../ecs/classes/SystemStateComponent";
import { FrameStyle, ParticleEmitterInterface } from "../interfaces";

/** Interface for state of particle emitter. */
interface ParticleEmitterStateInterface {
  /** 3D particle emitter. */
  emitter3D: any;
  /** Whether to use rotation of the entity for this particle emitter. */
  useEntityRotation: boolean;
  /** Whether to sync transform of the entity. */
  syncTransform: boolean;
}

/** Component class for state of particle emitter. */
export class ParticleEmitterState extends SystemStateComponent<ParticleEmitterStateInterface> {
  /** 3D particle emitter. */
  emitter3D: any
  /** Whether to use rotation of the entity for this particle emitter. */
  useEntityRotation: boolean
  /** Whether to sync transform of the entity. */
  syncTransform: boolean
}

ParticleEmitterState._schema = {
  ...ParticleEmitterState._schema,
  emitter3D: { type: Types.Ref },
  useEntityRotation: { type: Types.Boolean, default: true },
  syncTransform: { type: Types.Boolean, default: false }
};

/** Class component for particle emitter. */
export class ParticleEmitter extends Component<ParticleEmitterInterface> {
  /** Mesh for individual particle. */
  particleMesh: any
  /** Is enabled. */
  enabled: boolean
  /** Number of particles to emit */
  count: number
  /** Map of particles. */
  atlas: string
  textureFrame: any
  /** Frames for particle animation. */
  frames: any[]
  /** Life time of a single particle. */
  lifeTime: number
  /** Particle repeat time. */
  repeatTime: number
  
  spawnVariance: number
  /** Spawn all particles at once. */
  burst: number
  /** Whether to sync transform of the entity. */
  syncTransform: boolean
  /** Whether to use rotation of the entity for this particle emitter. */
  useEntityRotation: boolean
  /** Particles relative to world UP. They will get rotated if the camera tilts. */
  worldUp: boolean
  /** Color vector for particles. */
  colors: { r: number; g: number; b: number }[]
  /** Orientation of the emitter. */
  orientations: number[]
  /** Scale of the emitter. */
  scales: number[]
  /** Opacity of the particles. */
  opacities: number[]
  /** Frame style for particles. */
  frameStyle: FrameStyle
  /** Spawn offset for particles. */
  offset: { x: number; y: number; z: number }
  /** Velocity of particles. */
  velocity: { x: number; y: number; z: number }
  /** Acceleration of particles. */
  acceleration: { x: number; y: number; z: number }
  /** Radial velocity of particles. */
  radialVelocity: number
  /** Radial acceleration of particles. */
  radialAcceleration: number
  /** Angular velocity of particles. */
  angularVelocity: { x: number; y: number; z: number }
  /** Angular acceleration of particles. */
  angularAcceleration: { x: number; y: number; z: number }
  /** Orbital velocity of particles. */
  orbitalVelocity: number
  /** Orbital acceleration of particles. */
  orbitalAcceleration: number
  /** World acceleration. */
  worldAcceleration: { x: number; y: number; z: number }
  /** Brownian speed of particles. */
  brownianSpeed: number
  /** Brownian scale of particles. */
  brownianScale: number
  /** Seed for randomness. */
  seed: number
  /** Scale applied to the velocity of all particles. */
  velocityScale: number
  /** Minimum velocity scale. */
  velocityScaleMin: number
  /** Maximum velocity scale. */
  velocityScaleMax: number
}

ParticleEmitter._schema = {
  ...ParticleEmitter._schema,
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

import { InstancedBufferGeometry, BufferGeometry, ShaderMaterial, Texture, Blending } from "three";
import { Material } from "cannon-es";
/** Particle geometry type. */
export declare type ParticleGeometry = InstancedBufferGeometry | BufferGeometry;
/** Type of frame styles. */
export declare type FrameStyle = "sequence" | "randomsequence" | "random";
/** Interface for particle mesh. */
export interface ParticleMesh {
    /** Geometry of particle mesh. */
    geometry: ParticleGeometry;
    /** Material for particles. */
    material: ParticleMeshMaterial;
    /** User data. */
    userData: {
        nextIndex: number;
        /** Configs for mesh. */
        meshConfig: any;
    };
}
/** Material for particle mesh. */
export interface ParticleMeshMaterial extends ShaderMaterial {
    /** Texture of particle */
    map: Texture;
    /** Original material of particle. */
    originalMaterial: Material;
}
/** Interface for frame of texture. */
export interface textureFrame {
    /** Column count for this frame. */
    cols: number;
    /** Row count for this frame. */
    rows: number;
}
/** Interface for particle mesh options. */
export interface particleMeshOptions {
    /** Number of particles in this mesh. */
    particleCount?: number;
    texture?: string | Texture;
    textureFrame?: textureFrame;
    style?: "particle" | "mesh";
    mesh?: any;
    particleSize?: number;
    transparent?: boolean;
    alphaTest?: number;
    depthWrite?: boolean;
    depthTest?: boolean;
    blending?: Blending;
    fog?: boolean;
    usePerspective?: boolean;
    useLinearMotion?: boolean;
    useOrbitalMotion?: boolean;
    useAngularMotion?: boolean;
    useRadialMotion?: boolean;
    useWorldMotion?: boolean;
    useBrownianMotion?: boolean;
    useVelocityScale?: boolean;
    useFramesOrOrientation?: boolean;
}
/** Interface for particle emitter. */
export interface ParticleEmitter {
    startTime: number;
    startIndex: number;
    endIndex: number;
    mesh: ParticleMesh;
}
/** Interface for emitter options. */
export interface emitterOptions {
    particleMesh: ParticleMesh;
    enabled?: boolean;
    count?: number;
    textureFrame?: textureFrame;
    lifeTime?: number | number[];
    repeatTime?: number;
    burst?: number;
    seed?: number;
    worldUp?: boolean;
}
/** Interface for particle options. */
export interface particleOptions {
    atlas?: string;
    frames?: number[];
    colors?: Color[];
    orientations?: number[];
    scales?: number[];
    opacities?: number[];
    frameStyle?: FrameStyle;
    offset?: Vector;
    velocity?: Vector;
    acceleration?: Vector;
    radialVelocity?: number;
    radialAcceleration?: number;
    angularVelocity?: Vector;
    angularAcceleration?: Vector;
    orbitalVelocity?: number;
    orbitalAcceleration?: number;
    worldAcceleration?: Vector;
    brownianSpeed?: number;
    brownianScale?: number;
    velocityScale?: number;
    velocityScaleMin?: number;
    velocityScaleMax?: number;
}
/** Interface for particle Emitter. */
export interface ParticleEmitterInterface extends emitterOptions, particleOptions {
}
/** Interface ofr Vector3. */
export interface Vector {
    x: number;
    y: number;
    z: number;
}
/** Interface for Color vector. */
export interface Color {
    r: number;
    g: number;
    b: number;
}

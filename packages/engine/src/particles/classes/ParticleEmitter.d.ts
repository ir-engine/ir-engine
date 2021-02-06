import { Matrix4 } from "three";
import { ParticleEmitter, ParticleEmitterInterface } from "../interfaces";
/**
 * Create particle emitter.
 * @param options Options for particle emitter.
 * @param matrixWorld Matrix world of particle emitter.
 * @param time Emitter time.
 *
 * @returns Newly created particle emitter.
 */
export declare function createParticleEmitter(options: ParticleEmitterInterface, matrixWorld: Matrix4, time?: number): ParticleEmitter;
/**
 * Delete particle emitter.
 * @param emitter Emitter to be deleted.
 */
export declare function deleteParticleEmitter(emitter: ParticleEmitter): void;
/**
 * Set particle emitter time.
 * @param emitter Particle emitter.
 * @param time Time of the particle emitter.
 */
export declare function setEmitterTime(emitter: ParticleEmitter, time: number): void;
/**
 * Apply matrix world to particle emitter.
 * @param emitter Particle emitter.
 * @param matrixWorld Matrix world to be applied on particle emitter.
 * @param time Time to be applied on particle emitter.
 * @param deltaTime Time since last frame.
 */
export declare function setEmitterMatrixWorld(emitter: ParticleEmitter, matrixWorld: Matrix4, time: number, deltaTime: number): void;

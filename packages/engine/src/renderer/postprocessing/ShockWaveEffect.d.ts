import { Vector3 } from 'three';
import { Effect } from './Effect';
/**
 * A shock wave effect.
 *
 * Based on a Gist by Jean-Philippe Sarda:
 *  https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
 *
 * Warning: This effect cannot be merged with convolution effects.
 */
export declare class ShockWaveEffect extends Effect {
    camera: any;
    epicenter: Vector3;
    screenPosition: any;
    speed: number;
    time: number;
    active: boolean;
    /**
       * Constructs a new shock wave effect.
       *
       * @param {Camera} camera - The main camera.
       * @param {Vector3} [epicenter] - The world position of the shock wave epicenter.
       * @param {Object} [options] - The options.
       * @param {Number} [options.speed=2.0] - The animation speed.
       * @param {Number} [options.maxRadius=1.0] - The extent of the shock wave.
       * @param {Number} [options.waveSize=0.2] - The wave size.
       * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
       */
    constructor(camera: any, epicenter?: Vector3, { speed, maxRadius, waveSize, amplitude }?: {
        speed?: number;
        maxRadius?: number;
        waveSize?: number;
        amplitude?: number;
    });
    /**
       * Emits the shock wave.
       */
    explode(): void;
    /**
       * Updates this effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {Number} [delta] - The time between the last frame and the current one in seconds.
       */
    update(renderer: any, inputBuffer: any, delta: any): void;
}

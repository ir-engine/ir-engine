import { Vector2 } from 'three';
import { Effect } from './Effect';
/**
 * A scanline effect.
 */
export declare class ScanlineEffect extends Effect {
    resolution: Vector2;
    density: number;
    /**
       * Constructs a new scanline effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
       * @param {Number} [options.density=1.25] - The scanline density.
       */
    constructor({ blendFunction, density }?: {
        blendFunction?: number;
        density?: number;
    });
    /**
       * Returns the current scanline density.
       *
       * @return {Number} The scanline density.
       */
    getDensity(): number;
    /**
       * Sets the scanline density.
       *
       * @param {Number} density - The new scanline density.
       */
    setDensity(density: any): void;
    /**
       * Updates the size of this pass.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
}

import { Vector2 } from 'three';
import { Effect } from './Effect';
/**
 * A pixelation effect.
 *
 * Warning: This effect cannot be merged with convolution effects.
 */
export declare class PixelationEffect extends Effect {
    resolution: Vector2;
    granularity: number;
    /**
       * Constructs a new pixelation effect.
       *
       * @param {Object} [granularity=30.0] - The pixel granularity.
       */
    constructor(granularity?: number);
    /**
       * Returns the pixel granularity.
       *
       * @return {Number} The granularity.
       */
    getGranularity(): number;
    /**
       * Sets the pixel granularity.
       *
       * A higher value yields coarser visuals.
       *
       * @param {Number} granularity - The new granularity.
       */
    setGranularity(granularity: any): void;
    /**
       * Updates the granularity.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
}

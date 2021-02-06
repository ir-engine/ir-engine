import { Vector2 } from 'three';
import { Effect } from './Effect';
/**
 * A grid effect.
 */
export declare class GridEffect extends Effect {
    resolution: Vector2;
    scale: number;
    lineWidth: number;
    /**
       * Constructs a new grid effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.OVERLAY] - The blend function of this effect.
       * @param {Number} [options.scale=1.0] - The scale of the grid pattern.
       * @param {Number} [options.lineWidth=0.0] - The line width of the grid pattern.
       */
    constructor({ blendFunction, scale, lineWidth }?: {
        blendFunction?: number;
        scale?: number;
        lineWidth?: number;
    });
    /**
       * Returns the current grid scale.
       *
       * @return {Number} The grid scale.
       */
    getScale(): number;
    /**
       * Sets the grid scale.
       *
       * @param {Number} scale - The new grid scale.
       */
    setScale(scale: any): void;
    /**
       * Returns the current grid line width.
       *
       * @return {Number} The grid line width.
       */
    getLineWidth(): number;
    /**
       * Sets the grid line width.
       *
       * @param {Number} lineWidth - The new grid line width.
       */
    setLineWidth(lineWidth: any): void;
    /**
       * Updates the size of this pass.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
}

import { Effect } from './Effect';
/**
 * A dot screen effect.
 */
export declare class DotScreenEffect extends Effect {
    uniforms: any;
    /**
       * Constructs a new dot screen effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.angle=1.57] - The angle of the dot pattern.
       * @param {Number} [options.scale=1.0] - The scale of the dot pattern.
       */
    constructor({ blendFunction, angle, scale }?: {
        blendFunction?: number;
        angle?: number;
        scale?: number;
    });
    /**
       * Sets the pattern angle.
       *
       * @param {Number} [angle] - The angle of the dot pattern.
       */
    setAngle(angle: any): void;
}

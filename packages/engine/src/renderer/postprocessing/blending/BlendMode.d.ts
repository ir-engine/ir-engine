import { EventDispatcher, Uniform } from 'three';
/**
 * A blend mode.
 */
export declare class BlendMode extends EventDispatcher {
    blendFunction: any;
    opacity: Uniform;
    /**
       * Constructs a new blend mode.
       *
       * @param {BlendFunction} blendFunction - The blend function to use.
       * @param {Number} opacity - The opacity of the color that will be blended with the base color.
       */
    constructor(blendFunction: any, opacity?: number);
    /**
       * Returns the blend function.
       *
       * @return {BlendFunction} The blend function.
       */
    getBlendFunction(): any;
    /**
       * Sets the blend function.
       *
       * @param {BlendFunction} blendFunction - The blend function.
       */
    setBlendFunction(blendFunction: any): void;
    /**
       * Returns the blend function shader code.
       *
       * @return {String} The blend function shader code.
       */
    getShaderCode(): string;
}

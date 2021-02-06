import { Effect } from './Effect';
/**
 * A texture effect.
 */
export declare class TextureEffect extends Effect {
    /**
       * Constructs a new texture effect.
       *
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Texture} [options.texture] - A texture.
       * @param {Boolean} [options.aspectCorrection=false] - Deprecated. Enable uvTransform instead and adjust the texture's offset, repeat and center.
       */
    constructor({ blendFunction, texture, aspectCorrection }?: {
        blendFunction?: number;
        texture?: any;
        aspectCorrection?: boolean;
    });
    /**
       * The texture.
       *
       * @type {Texture}
       */
    get texture(): any;
    /**
       * Sets the texture.
       *
       * @type {Texture}
       */
    set texture(value: any);
    /**
       * Indicates whether aspect correction is enabled.
       *
       * If enabled, the texture can be scaled using the `scale` uniform.
       *
       * @type {Number}
       * @deprecated Use uvTransform instead for full control over the texture coordinates.
       */
    get aspectCorrection(): boolean;
    /**
       * Enables or disables aspect correction.
       *
       * @type {Number}
       * @deprecated Use uvTransform instead for full control over the texture coordinates.
       */
    set aspectCorrection(value: boolean);
    /**
       * Indicates whether the texture UV coordinates will be transformed using the
       * transformation matrix of the texture.
       *
       * Cannot be used if aspect correction is enabled.
       *
       * @type {Boolean}
       */
    get uvTransform(): boolean;
    /**
       * Enables or disables texture UV transformation.
       *
       * @type {Boolean}
       */
    set uvTransform(value: boolean);
    /**
       * Sets the swizzles that will be applied to the `r`, `g`, `b`, and `a`
       * components of a texel before it is written to the output color.
       *
       * @param {ColorChannel} r - The swizzle for the `r` component.
       * @param {ColorChannel} [g=r] - The swizzle for the `g` component.
       * @param {ColorChannel} [b=r] - The swizzle for the `b` component.
       * @param {ColorChannel} [a=r] - The swizzle for the `a` component.
       */
    setTextureSwizzleRGBA(r: any, g?: any, b?: any, a?: any): void;
    /**
       * Updates this effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       */
    update(renderer: any, inputBuffer: any, deltaTime: any): void;
}

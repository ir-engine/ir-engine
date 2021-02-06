import { ShaderMaterial } from 'three';
/**
 * A bokeh blur material.
 *
 * This material should be applied twice in a row, with `fill` mode enabled for
 * the second pass.
 *
 * Enabling the `foreground` option causes the shader to combine the near and
 * far CoC values around foreground objects.
 */
export declare class BokehMaterial extends ShaderMaterial {
    /**
       * Constructs a new bokeh material.
       *
       * @param {Boolean} [fill=false] - Enables or disables the bokeh highlight fill mode.
       * @param {Boolean} [foreground=false] - Determines whether this material will be applied to foreground colors.
       */
    constructor(fill?: boolean, foreground?: boolean);
    /**
       * Generates the blur kernels; one big one and a small one for highlights.
       *
       * @private
       */
    generateKernel(): void;
    /**
       * Sets the texel size.
       *
       * @param {Number} x - The texel width.
       * @param {Number} y - The texel height.
       */
    setTexelSize(x: any, y: any): void;
}

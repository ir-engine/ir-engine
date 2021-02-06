import { ShaderMaterial, Vector2 } from 'three';
/**
 * An outline shader material.
 */
export declare class OutlineMaterial extends ShaderMaterial {
    /**
       * Constructs a new outline material.
       *
       * @param {Vector2} [texelSize] - The screen texel size.
       */
    constructor(texelSize?: Vector2);
    /**
       * Sets the texel size.
       *
       * @param {Number} x - The texel width.
       * @param {Number} y - The texel height.
       */
    setTexelSize(x: any, y: any): void;
}
/**
 * An outline shader material.
 *
 * @deprecated Use OutlineMaterial instead.
 */
export declare const OutlineEdgesMaterial: typeof OutlineMaterial;

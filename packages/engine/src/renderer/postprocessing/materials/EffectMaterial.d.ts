import { ShaderMaterial } from 'three';
/**
 * An effect material for compound shaders.
 *
 * This material supports dithering.
 *
 * @implements {Resizable}
 */
export declare class EffectMaterial extends ShaderMaterial {
    /**
       * Constructs a new effect material.
       *
       * @param {Map<String, String>} [shaderParts=null] - A collection of shader snippets. See {@link Section}.
       * @param {Map<String, String>} [defines=null] - A collection of preprocessor macro definitions.
       * @param {Map<String, Uniform>} [uniforms=null] - A collection of uniforms.
       * @param {Camera} [camera=null] - A camera.
       * @param {Boolean} [dithering=false] - Whether dithering should be enabled.
       */
    constructor(shaderParts?: any, defines?: any, uniforms?: any, camera?: any, dithering?: boolean);
    /**
       * The current depth packing.
       *
       * @type {Number}
       */
    get depthPacking(): number;
    /**
       * Sets the depth packing.
       *
       * Use `BasicDepthPacking` or `RGBADepthPacking` if your depth texture
       * contains packed depth.
       *
       * @type {Number}
       */
    set depthPacking(value: number);
    /**
       * Sets the shader parts.
       *
       * @param {Map<String, String>} shaderParts - A collection of shader snippets. See {@link Section}.
       * @return {EffectMaterial} This material.
       */
    setShaderParts(shaderParts: any): this;
    /**
       * Sets the shader macros.
       *
       * @param {Map<String, String>} defines - A collection of preprocessor macro definitions.
       * @return {EffectMaterial} This material.
       */
    setDefines(defines: any): this;
    /**
       * Sets the shader uniforms.
       *
       * @param {Map<String, Uniform>} uniforms - A collection of uniforms.
       * @return {EffectMaterial} This material.
       */
    setUniforms(uniforms: any): this;
    /**
       * Adopts the settings of the given camera.
       *
       * @param {Camera} [camera=null] - A camera.
       */
    adoptCameraSettings(camera?: any): void;
    /**
       * Sets the resolution.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
}
/**
 * An enumeration of shader code placeholders used by the {@link EffectPass}.
 *
 * @type {Object}
 * @property {String} FRAGMENT_HEAD - A placeholder for function and variable declarations inside the fragment shader.
 * @property {String} FRAGMENT_MAIN_UV - A placeholder for UV transformations inside the fragment shader.
 * @property {String} FRAGMENT_MAIN_IMAGE - A placeholder for color calculations inside the fragment shader.
 * @property {String} VERTEX_HEAD - A placeholder for function and variable declarations inside the vertex shader.
 * @property {String} VERTEX_MAIN_SUPPORT - A placeholder for supporting calculations inside the vertex shader.
 */
export declare const Section: {
    FRAGMENT_HEAD: string;
    FRAGMENT_MAIN_UV: string;
    FRAGMENT_MAIN_IMAGE: string;
    VERTEX_HEAD: string;
    VERTEX_MAIN_SUPPORT: string;
};

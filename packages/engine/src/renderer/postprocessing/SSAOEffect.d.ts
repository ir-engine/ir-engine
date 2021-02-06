import { WebGLRenderTarget } from 'three';
import { Resizer } from './core/Resizer';
import { ShaderPass } from './passes/ShaderPass';
import { Effect } from './Effect';
/**
 * A Screen Space Ambient Occlusion (SSAO) effect.
 *
 * For high quality visuals use two SSAO effect instances in a row with
 * different radii, one for rough AO and one for fine details.
 *
 * This effect supports depth-aware upsampling and should be rendered at a lower
 * resolution. The resolution should match that of the downsampled normals and
 * depth. If you intend to render SSAO at full resolution, do not provide a
 * downsampled `normalDepthBuffer` and make sure to disable
 * `depthAwareUpsampling`.
 *
 * It's recommended to specify a relative render resolution using the
 * `resolutionScale` constructor parameter to avoid undesired sampling patterns.
 *
 * Based on "Scalable Ambient Obscurance" by Morgan McGuire et al. and
 * "Depth-aware upsampling experiments" by Eleni Maria Stea:
 * https://research.nvidia.com/publication/scalable-ambient-obscurance
 * https://eleni.mutantstargoat.com/hikiko/on-depth-aware-upsampling
 */
export declare class SSAOEffect extends Effect {
    renderTargetAO: WebGLRenderTarget;
    resolution: Resizer;
    r: number;
    camera: any;
    ssaoPass: ShaderPass;
    /**
       * Constructs a new SSAO effect.
       *
       * @todo Move normalBuffer to options.
       * @param {Camera} camera - The main camera.
       * @param {Texture} normalBuffer - A texture that contains the scene normals. May be null if a normalDepthBuffer is provided. See {@link NormalPass}.
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.MULTIPLY] - The blend function of this effect.
       * @param {Boolean} [options.distanceScaling=true] - Enables or disables distance-based radius scaling.
       * @param {Boolean} [options.depthAwareUpsampling=true] - Enables or disables depth-aware upsampling. Has no effect if WebGL 2 is not supported.
       * @param {Texture} [options.normalDepthBuffer=null] - A texture that contains downsampled scene normals and depth. See {@link DepthDownsamplingPass}.
       * @param {Number} [options.samples=9] - The amount of samples per pixel. Should not be a multiple of the ring count.
       * @param {Number} [options.rings=7] - The amount of spiral turns in the occlusion sampling pattern. Should be a prime number.
       * @param {Number} [options.distanceThreshold=0.97] - A global distance threshold at which the occlusion effect starts to fade out. Range [0.0, 1.0].
       * @param {Number} [options.distanceFalloff=0.03] - The distance falloff. Influences the smoothness of the overall occlusion cutoff. Range [0.0, 1.0].
       * @param {Number} [options.rangeThreshold=0.0005] - A local occlusion range threshold at which the occlusion starts to fade out. Range [0.0, 1.0].
       * @param {Number} [options.rangeFalloff=0.001] - The occlusion range falloff. Influences the smoothness of the proximity cutoff. Range [0.0, 1.0].
       * @param {Number} [options.minRadiusScale=0.33] - The minimum radius scale. Has no effect if distance scaling is disabled.
       * @param {Number} [options.luminanceInfluence=0.7] - Determines how much the luminance of the scene influences the ambient occlusion.
       * @param {Number} [options.radius=0.1825] - The occlusion sampling radius, expressed as a resolution independent scale. Range [1e-6, 1.0].
       * @param {Number} [options.intensity=1.0] - The intensity of the ambient occlusion.
       * @param {Number} [options.bias=0.025] - An occlusion bias. Eliminates artifacts caused by depth discontinuities.
       * @param {Number} [options.fade=0.01] - Influences the smoothness of the shadows. A lower value results in higher contrast.
       * @param {Color} [options.color=null] - The color of the ambient occlusion.
       * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       */
    constructor(camera: any, normalBuffer: any, { blendFunction, distanceScaling, depthAwareUpsampling, normalDepthBuffer, samples, rings, distanceThreshold, distanceFalloff, rangeThreshold, rangeFalloff, minRadiusScale, luminanceInfluence, radius, intensity, bias, fade, color, resolutionScale, width, height }?: {
        blendFunction?: number;
        distanceScaling?: boolean;
        depthAwareUpsampling?: boolean;
        normalDepthBuffer?: any;
        samples?: number;
        rings?: number;
        distanceThreshold?: number;
        distanceFalloff?: number;
        rangeThreshold?: number;
        rangeFalloff?: number;
        minRadiusScale?: number;
        luminanceInfluence?: number;
        radius?: number;
        intensity?: number;
        bias?: number;
        fade?: number;
        color?: any;
        resolutionScale?: number;
        width?: number;
        height?: number;
    });
    /**
       * The SSAO material.
       *
       * @type {SSAOMaterial}
       */
    get ssaoMaterial(): any;
    /**
       * The amount of occlusion samples per pixel.
       *
       * @type {Number}
       */
    get samples(): number;
    /**
       * Sets the amount of occlusion samples per pixel.
       *
       * @type {Number}
       */
    set samples(value: number);
    /**
       * The amount of spiral turns in the occlusion sampling pattern.
       *
       * @type {Number}
       */
    get rings(): number;
    /**
       * Sets the amount of spiral turns in the occlusion sampling pattern.
       *
       * @type {Number}
       */
    set rings(value: number);
    /**
       * The occlusion sampling radius.
       *
       * @type {Number}
       */
    get radius(): number;
    /**
       * Sets the occlusion sampling radius. Range [1e-6, 1.0].
       *
       * @type {Number}
       */
    set radius(value: number);
    /**
       * Indicates whether depth-aware upsampling is enabled.
       *
       * @type {Boolean}
       */
    get depthAwareUpsampling(): boolean;
    /**
       * Enables or disables depth-aware upsampling.
       *
       * @type {Boolean}
       */
    set depthAwareUpsampling(value: boolean);
    /**
       * Indicates whether distance-based radius scaling is enabled.
       *
       * @type {Boolean}
       */
    get distanceScaling(): boolean;
    /**
       * Enables or disables distance-based radius scaling.
       *
       * @type {Boolean}
       */
    set distanceScaling(value: boolean);
    /**
       * The color of the ambient occlusion.
       *
       * @type {Color}
       */
    get color(): any;
    /**
       * Sets the color of the ambient occlusion.
       *
       * Set to `null` to disable colorization.
       *
       * @type {Color}
       */
    set color(value: any);
    /**
       * Sets the occlusion distance cutoff.
       *
       * @param {Number} threshold - The distance threshold. Range [0.0, 1.0].
       * @param {Number} falloff - The falloff. Range [0.0, 1.0].
       */
    setDistanceCutoff(threshold: any, falloff: any): void;
    /**
       * Sets the occlusion proximity cutoff.
       *
       * @param {Number} threshold - The range threshold. Range [0.0, 1.0].
       * @param {Number} falloff - The falloff. Range [0.0, 1.0].
       */
    setProximityCutoff(threshold: any, falloff: any): void;
    /**
       * Sets the depth texture.
       *
       * @param {Texture} depthTexture - A depth texture.
       * @param {Number} [depthPacking=0] - The depth packing.
       */
    setDepthTexture(depthTexture: any, depthPacking?: number): void;
    /**
       * Updates this effect.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       */
    update(renderer: any, inputBuffer: any, deltaTime: any): void;
    /**
       * Updates the camera projection matrix uniforms and the size of internal
       * render targets.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
}

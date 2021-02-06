import { WebGLRenderTarget } from 'three';
import { Effect } from './Effect';
/**
 * A depth of field effect.
 *
 * Based on a graphics study by Adrian Courrèges and an article by Steve Avery:
 *  https://www.adriancourreges.com/blog/2016/09/09/doom-2016-graphics-study/
 *  https://pixelmischiefblog.wordpress.com/2016/11/25/bokeh-depth-of-field/
 */
export declare class DepthOfFieldEffect extends Effect {
    camera: any;
    renderTarget: WebGLRenderTarget;
    renderTargetMasked: any;
    renderTargetNear: any;
    uniforms: any;
    renderTargetFar: any;
    renderTargetCoC: any;
    renderTargetCoCBlurred: any;
    cocPass: any;
    blurPass: any;
    maskPass: any;
    bokehNearBasePass: any;
    bokehNearFillPass: any;
    bokehFarBasePass: any;
    bokehFarFillPass: any;
    target: any;
    /**
       * Constructs a new depth of field effect.
       *
       * @param {Camera} camera - The main camera.
       * @param {Object} [options] - The options.
       * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
       * @param {Number} [options.focusDistance=0.0] - The normalized focus distance. Range is [0.0, 1.0].
       * @param {Number} [options.focalLength=0.05] - The focal length. Range is [0.0, 1.0].
       * @param {Number} [options.bokehScale=1.0] - The scale of the bokeh blur.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
       */
    constructor(camera: any, { blendFunction, focusDistance, focalLength, bokehScale, width, height }?: {
        blendFunction?: number;
        focusDistance?: number;
        focalLength?: number;
        bokehScale?: number;
        width?: number;
        height?: number;
    });
    /**
       * The circle of confusion material.
       *
       * @type {CircleOfConfusionMaterial}
       */
    get circleOfConfusionMaterial(): any;
    /**
       * The resolution of this effect.
       *
       * @type {Resizer}
       */
    get resolution(): any;
    /**
       * The current bokeh scale.
       *
       * @type {Number}
       */
    get bokehScale(): any;
    /**
       * Sets the bokeh scale.
       *
       * @type {Number}
       */
    set bokehScale(value: any);
    /**
       * Calculates the focus distance from the camera to the given position.
       *
       * @param {Vector3} target - The target.
       * @return {Number} The normalized focus distance.
       */
    calculateFocusDistance(target: any): number;
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
       * Updates the size of internal render targets.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       */
    setSize(width: any, height: any): void;
    /**
       * Performs initialization tasks.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
}

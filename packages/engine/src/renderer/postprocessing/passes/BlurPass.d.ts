import { WebGLRenderTarget } from 'three';
import { Resizer } from '../core/Resizer';
import { Pass } from './Pass';
/**
 * An efficient, incremental blur pass.
 */
export declare class BlurPass extends Pass {
    renderTargetA: WebGLRenderTarget;
    renderTargetB: any;
    resolution: Resizer;
    convolutionMaterial: any;
    ditheredConvolutionMaterial: any;
    dithering: boolean;
    scene: any;
    camera: any;
    /**
       * Constructs a new blur pass.
       *
       * @param {Object} [options] - The options.
       * @param {Number} [options.resolutionScale=0.5] - Deprecated. Adjust the height or width instead for consistent results.
       * @param {Number} [options.width=Resizer.AUTO_SIZE] - The blur render width.
       * @param {Number} [options.height=Resizer.AUTO_SIZE] - The blur render height.
       * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
       */
    constructor({ resolutionScale, width, height, kernelSize }: {
        resolutionScale?: number;
        width?: number;
        height?: number;
        kernelSize?: number;
    });
    /**
       * The current width of the internal render targets.
       *
       * @type {Number}
       * @deprecated Use resolution.width instead.
       */
    get width(): any;
    /**
       * Sets the render width.
       *
       * @type {Number}
       * @deprecated Use resolution.width instead.
       */
    set width(value: any);
    /**
       * The current height of the internal render targets.
       *
       * @type {Number}
       * @deprecated Use resolution.height instead.
       */
    get height(): any;
    /**
       * Sets the render height.
       *
       * @type {Number}
       * @deprecated Use resolution.height instead.
       */
    set height(value: any);
    /**
       * The current blur scale.
       *
       * @type {Number}
       */
    get scale(): any;
    /**
       * Sets the blur scale.
       *
       * This value influences the overall blur strength and should not be greater
       * than 1. For larger blurs please increase the {@link kernelSize}!
       *
       * Note that the blur strength is closely tied to the resolution. For a smooth
       * transition from no blur to full blur, set the width or the height to a high
       * enough value.
       *
       * @type {Number}
       */
    set scale(value: any);
    /**
       * The kernel size.
       *
       * @type {KernelSize}
       */
    get kernelSize(): any;
    /**
       * Sets the kernel size.
       *
       * Larger kernels require more processing power but scale well with larger
       * render resolutions.
       *
       * @type {KernelSize}
       */
    set kernelSize(value: any);
    /**
       * Returns the current resolution scale.
       *
       * @return {Number} The resolution scale.
       * @deprecated Adjust the fixed resolution width or height instead.
       */
    getResolutionScale(): number;
    /**
       * Sets the resolution scale.
       *
       * @param {Number} scale - The new resolution scale.
       * @deprecated Adjust the fixed resolution width or height instead.
       */
    setResolutionScale(scale: any): void;
    /**
       * Blurs the input buffer and writes the result to the output buffer. The
       * input buffer remains intact, unless it's also the output buffer.
       *
       * @param {WebGLRenderer} renderer - The renderer.
       * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
       * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
       * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
       * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
       */
    render(renderer: any, inputBuffer: any, outputBuffer: any, deltaTime?: any, stencilTest?: any): void;
    /**
       * Updates the size of this pass.
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
    /**
       * An auto sizing flag.
       *
       * @type {Number}
       * @deprecated Use {@link Resizer.AUTO_SIZE} instead.
       */
    static get AUTO_SIZE(): number;
}

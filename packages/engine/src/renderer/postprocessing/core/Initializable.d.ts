/**
 * The initializable contract.
 *
 * Implemented by objects that can be initialized.
 *
 * @interface
 */
export declare class Initializable {
    /**
       * Performs initialization tasks.
       *
       * @param {WebGLRenderer} renderer - A renderer.
       * @param {Boolean} alpha - Whether the renderer uses the alpha channel.
       * @param {Number} frameBufferType - The type of the main frame buffers.
       */
    initialize(renderer: any, alpha: any, frameBufferType: any): void;
}

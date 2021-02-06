/**
 * Creates a new canvas from raw image data.
 *
 * @private
 * @param {Number} width - The image width.
 * @param {Number} height - The image height.
 * @param {Uint8ClampedArray} data - The image data.
 * @return {Canvas} The canvas.
 */
/**
 * A container for raw image data.
 */
export declare class RawImageData {
    width: number;
    height: number;
    data: any;
    /**
       * Constructs a new image data container.
       *
       * @param {Number} [width=0] - The width of the image.
       * @param {Number} [height=0] - The height of the image.
       * @param {Uint8ClampedArray} [data=null] - The image data.
       */
    constructor(width?: number, height?: number, data?: any);
    /**
       * Creates a canvas from this image data.
       *
       * @return {Canvas} The canvas or null if it couldn't be created.
       */
    toCanvas(): HTMLElement;
    /**
       * Creates a new image data container.
       *
       * @param {Object} data - Raw image data.
       * @return {RawImageData} The image data.
       */
    static from(data: any): RawImageData;
}

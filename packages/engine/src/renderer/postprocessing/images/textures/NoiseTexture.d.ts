import { DataTexture } from 'three';
/**
 * A simple noise texture.
 */
export declare class NoiseTexture extends DataTexture {
    /**
       * Constructs a new noise texture.
       *
       * The texture format can be either `LuminanceFormat`, `RGBFormat` or
       * `RGBAFormat`. Additionally, the formats `RedFormat` and `RGFormat` can be
       * used in a WebGL 2 context.
       *
       * @param {Number} width - The width.
       * @param {Number} height - The height.
       * @param {Number} [format=LuminanceFormat] - The texture format.
       * @param {Number} [type=UnsignedByteType] - The texture type.
       */
    constructor(width: any, height: any, format?: import("three").PixelFormat, type?: import("three").TextureDataType);
}

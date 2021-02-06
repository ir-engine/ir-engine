import { Texture } from 'three';
/** Loader class for TGA asset. */
export declare class TGALoader {
    /** Path of the asset. */
    path: any;
    /** Loading manager for TGA asset. */
    manager: any;
    /** Constructs TGA Loader. */
    constructor();
    /** Load TGA texture. */
    load(url: any, onLoad: any, onProgress: any, onError: any): Texture;
    /** Parse the asset. */
    parse(buffer: any): any;
    /** Setter method for path Property. */
    setPath(value: any): TGALoader;
}

import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { AssetUrl } from "../types/AssetTypes";
/**
 * Interface for result of the GLTF Asset load.
 */
export interface LoadGLTFResultInterface {
    scene: any;
    json: any;
    stats: any;
}
export declare function getLoader(): GLTFLoader;
/**
 * Loads an Asset which is in GLTF format.
 *
 * @param url URL of the asset.
 * @returns a promise of {@link LoadGLTFResultInterface}.
 */
export declare function LoadGLTF(url: AssetUrl): Promise<LoadGLTFResultInterface>;
export declare const loadExtentions: (gltf: any) => void;

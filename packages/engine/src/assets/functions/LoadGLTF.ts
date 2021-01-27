import { DRACOLoader } from "../loaders/gltf/DRACOLoader";
import NodeDRACOLoader from "../loaders/gltf/NodeDRACOLoader";
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { AssetUrl } from "../types/AssetTypes";
import { isClient } from "../../common/functions/isClient";

/**
 * Interface for result of the GLTF Asset load.
 */
export interface LoadGLTFResultInterface {
    scene: any;
    json: any;
    stats: any;
}

/**
 * Loads an Asset which is in GLTF format.
 * 
 * @param url URL of the asset.
 * @returns a promise of {@link LoadGLTFResultInterface}.
 */
export async function LoadGLTF(url: AssetUrl): Promise<LoadGLTFResultInterface> {
    return await new Promise<LoadGLTFResultInterface>((resolve, reject) => {
        const loader = new GLTFLoader();
        let dracoLoader = null;
        if(isClient) {
            dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/loader_decoders/');
        }
        else {
            dracoLoader = new NodeDRACOLoader();
            (dracoLoader as any).getDecoderModule = () => {};
            (dracoLoader as any).preload = () => {};
        }
        loader.setDRACOLoader(dracoLoader);
        loader.load(url, (gltf) => {
             resolve({ scene: gltf.scene, json: {}, stats: {} }); }, null, (e) => { reject(e); });
    });
}
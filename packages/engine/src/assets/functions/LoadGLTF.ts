import { DRACOLoader } from "../loaders/gltf/DRACOLoader";
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { AssetUrl } from "../types/AssetTypes";

export interface LoadGLTFResultInterface {
 scene: any;
 json: any;
 stats: any;
}

export async function LoadGLTF(url: AssetUrl): Promise<LoadGLTFResultInterface> {
    return await new Promise<LoadGLTFResultInterface>((resolve, reject) => {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/loader_decoders/');
        loader.setDRACOLoader(dracoLoader);
        loader.load(url, (gltf) => { resolve({ scene: gltf.scene, json: {}, stats: {} }); }, null, (e) => { reject(e); });
    });
}
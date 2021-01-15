import { DRACOLoader } from "../loaders/gltf/DRACOLoader";
import NodeDRACOLoader from "../loaders/gltf/NodeDRACOLoader";
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { AssetUrl } from "../types/AssetTypes";
import { isClient } from "../../common/functions/isClient";
export interface LoadGLTFResultInterface {
 scene: any;
 json: any;
 stats: any;
}

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
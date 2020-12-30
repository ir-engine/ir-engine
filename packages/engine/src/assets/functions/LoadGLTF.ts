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
            console.log("************* IS CLIENT");
            dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('/loader_decoders/');
        }
        else {
            console.log("IS SERVER!")
            dracoLoader = new NodeDRACOLoader();
            DRACOLoader.getDecoderModule = () => {};
            DRACOLoader.preload = () => {};
        }
        loader.setDRACOLoader(dracoLoader);
        loader.load(url, (gltf) => {
             resolve({ scene: gltf.scene, json: {}, stats: {} }); }, null, (e) => { reject(e); });
    });
}
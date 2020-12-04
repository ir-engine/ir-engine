import { DRACOLoader } from "../loaders/gltf/DRACOLoader";
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { AssetUrl } from "../types/AssetTypes";

export async function LoadGLTF(url: AssetUrl) {

    const gltf = await new Promise<{ scene: any; json: any; stats: any }>((resolve) => {
        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('/loader_decoders/');
        loader.setDRACOLoader(dracoLoader);
        loader.load(url, (gltf) => { resolve({ scene: gltf.scene, json: {}, stats: {} }); });
    });
    return gltf;
}
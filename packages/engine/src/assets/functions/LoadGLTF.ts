import { DRACOLoader } from "../loaders/gltf/DRACOLoader";
//import { NodeDRACOLoader } from "../loaders/gltf/NodeDRACOLoader";
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import { AssetUrl } from "../types/AssetTypes";
import { isClient } from "../../common/functions/isClient";
export interface LoadGLTFResultInterface {
 scene: any;
 json: any;
 stats: any;
}
let decoder;
let NodeDRACOLoader;

if(!isClient){
  import("../loaders/gltf/NodeDRACOLoader")
  .then(obj => {
    decoder = obj.createDecoderModule().then(m => {
      NodeDRACOLoader = m;
      console.log('Decoder Module Initialized!');
    })
  })
  .catch(err => console.error("Error loading module"));
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

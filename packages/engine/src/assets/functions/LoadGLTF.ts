import { AmbientLight, DirectionalLight, PointLight } from 'three';
import { isClient } from "../../common/functions/isClient";
import { DRACOLoader } from "../loaders/gltf/DRACOLoader";
import { GLTFLoader } from "../loaders/gltf/GLTFLoader";
import NodeDRACOLoader from "../loaders/gltf/NodeDRACOLoader";
import { AssetUrl } from "../types/AssetTypes";

/**
 * Interface for result of the GLTF Asset load.
 */
export interface LoadGLTFResultInterface {
    scene: any;
    json: any;
    stats: any;
}

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

export function getLoader(): GLTFLoader {
    return loader;
}

/**
 * Loads an Asset which is in GLTF format.
 * 
 * @param url URL of the asset.
 * @returns a promise of {@link LoadGLTFResultInterface}.
 */
export async function LoadGLTF(url: AssetUrl): Promise<LoadGLTFResultInterface> {
    return await new Promise<LoadGLTFResultInterface>((resolve, reject) => {
        getLoader().load(url, (gltf) => {
            loadExtentions(gltf);
            resolve({ scene: gltf.scene, json: {}, stats: {} }); }, null, (e) => { reject(e); 
        });
    });
}

export const loadExtentions = gltf => {
    loadLightmaps(gltf.parser)
    loadLights(gltf)
}

const loadLightmaps = parser => {
    const loadLightmap = async (materialIndex) => {
        const lightmapDef = parser.json.materials[materialIndex].extensions.MOZ_lightmap;
        const [material, lightMap] = await Promise.all([
            parser.getDependency("material", materialIndex),
            parser.getDependency("texture", lightmapDef.index)
        ]);
        material.lightMap = lightMap;
        material.lightMapIntensity = lightmapDef.intensity !== undefined ? lightmapDef.intensity : 1;
        material.needsUpdate = true;
        return lightMap;
    };
    for (let i = 0; i < parser.json.materials.length; i++) {
        const materialNode = parser.json.materials[i];

        if (!materialNode.extensions) continue;

        if (materialNode.extensions.MOZ_lightmap) {
            loadLightmap(i);
        }
    }
};

// this isn't the best solution. instead we should expose the plugin/extension register in GLTFLoader.js 

const loadLights = gltf => {
    if(gltf.parser.json?.extensions?.MOZ_hubs_components?.MOZ_hubs_components.version === 3) {

        const objsToRemove = [];
        gltf.scene.traverse((obj) => {
            if (obj.userData.gltfExtensions && obj.userData.gltfExtensions.MOZ_hubs_components) {
                let replacement;
                switch(Object.keys(obj.userData.gltfExtensions.MOZ_hubs_components)[0]) {
                    // case 'directional-light': replacement = _directional(obj); break; // currently this breaks CSM
                    case 'point-light': replacement = _point(obj); break;
                    case 'ambient-light': replacement = _ambient(obj); break;
                    default:break;
                }
                if(replacement) {
                    replacement.position.copy(obj.position);
                    replacement.quaternion.copy(obj.quaternion);
                    obj.parent.add(replacement);
                    objsToRemove.push(obj);
                    console.log(replacement);
                }
            }
        });
        for(const obj of objsToRemove) {
            obj.parent.remove(obj);
        }
    }
};

const _shadow = (light, lightData) => {
    if(typeof lightData.castShadow !== 'undefined') light.castShadow = lightData.castShadow;
    if(typeof lightData.shadowResolution !== 'undefined') light.shadow.mapSize.set(lightData.shadowResolution[0], lightData.shadowResolution[1]);
    if(typeof lightData.shadowBias !== 'undefined') light.shadow.bias = lightData.shadowBias;
    if(typeof lightData.shadowRadius !== 'undefined') light.shadow.radius = lightData.shadowRadius;
};

const _directional = (obj) => {
    const lightData = obj.userData.gltfExtensions.MOZ_hubs_components['directional-light'];
    const light = new DirectionalLight(lightData.color, lightData.intensity);
    _shadow(light, lightData);
    return light;
};

const _point = (obj) => {
    const lightData = obj.userData.gltfExtensions.MOZ_hubs_components['point-light'];
    const light = new PointLight(lightData.color, lightData.intensity, lightData.distance, lightData.decay);
    _shadow(light, lightData);
    return light;
};

const _ambient = (obj) => {
    const lightData = obj.userData.gltfExtensions.MOZ_hubs_components['ambient-light'];
    const light = new AmbientLight(lightData.color, lightData.intensity);
    return light;
};
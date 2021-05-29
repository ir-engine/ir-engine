import { Mesh, Object3D } from "three";
import { WebGLRendererSystem } from "../../renderer/WebGLRendererSystem";

export const setupSceneObjects = (object: Object3D, args: { castShadow?: boolean, receiveShadow?: boolean } = {}) => {
  object.traverse((obj) => {
    if((args.castShadow || args.receiveShadow) && (obj as Mesh).material) {
      WebGLRendererSystem.instance.csm.setupMaterial((obj as Mesh).material);
    }
    if(args.castShadow) obj.castShadow = true;
    if(args.receiveShadow) obj.receiveShadow = true;
  })
}
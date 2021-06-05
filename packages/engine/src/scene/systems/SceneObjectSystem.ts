import type { Material, Mesh } from "three";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { beforeMaterialCompile } from "../../editor/nodes/helper/BPCEMShader";
import { WebGLRendererSystem } from "../../renderer/WebGLRendererSystem";
import { Object3DComponent } from "../components/Object3DComponent";

export class SceneObjectSystem extends System {

  updateType = SystemUpdateType.Fixed;
  static instance: SceneObjectSystem;
  bpcemOptions: {};

  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    this.bpcemOptions = {
      "probeScale": { x: 1, y: 1, z: 1 },
      "probePositionOffset": { x: 0, y: 0, z: 0 },
    };
    SceneObjectSystem.instance = this;
  }

  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.sceneObject.added) {
      const materialObject = getComponent(entity, Object3DComponent).value;
      materialObject.traverse((obj: Mesh) => {
        const material = obj.material as Material;
        if (typeof material !== 'undefined') {

          // BPCEM
          material.onBeforeCompile = beforeMaterialCompile((this.bpcemOptions as any).probeScale, (this.bpcemOptions as any).probePositionOffset);

          // CSM
          if (obj.receiveShadow) {
            WebGLRendererSystem.instance.csm.setupMaterial(material);
          }
        }
      });
    }
  }
}

SceneObjectSystem.queries = {
  sceneObject: {
    components: [Object3DComponent],
    listen: {
      removed: true,
      added: true
    }
  }
};

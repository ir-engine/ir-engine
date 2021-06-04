import { Mesh } from "three/src/objects/Mesh";
import { System,SystemAttributes } from "../../ecs/classes/System";
import { execute } from "../../ecs/functions/EngineFunctions";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { beforeMaterialCompile } from "../../editor/nodes/helper/BPCEMShader";
import { WebGLRendererSystem } from "../../renderer/WebGLRendererSystem";
import { Object3DComponent } from "../components/Object3DComponent";


export class MaterialSystem extends System {

    updateType = SystemUpdateType.Fixed;
    static instance:MaterialSystem;
    bpcemOptions:{};

  constructor(attributes: SystemAttributes = {}) {
    super(attributes);
    this.bpcemOptions={
      "probeScale":{x:1,y:1,z:1},
      "probePositionOffset":{x:0,y:0,z:0},
    };
    MaterialSystem.instance=this;
  }



  /** Executes the system. */
  execute(deltaTime, time): void {
    for (const entity of this.queryResults.setMaterial.added) {
      const materialObject = getComponent(entity, Object3DComponent).value;
      //const compHL = getComponent(entity, ReflectionProbeComponent);
      materialObject.traverse(obj => {
        if ((materialObject as any).material) {
          (materialObject as any).material.onBeforeCompile=beforeMaterialCompile((this.bpcemOptions as any).probeScale,(this.bpcemOptions as any).probePositionOffset);
          console.log("Setup Material here");
        }
      });
    }
  }
}

MaterialSystem.queries = {
  setMaterial: {
    components: [Object3DComponent],
    listen: {
      removed: true,
      added: true
    }
  }
};

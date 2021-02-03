import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

const scale = [100, 0.1, 100];
const floor = new BoxBufferGeometry(scale[0], scale[1], scale[2]);
const mat = new MeshPhongMaterial({ color: "#ffffff" });
const floorMesh = new Mesh( floor, mat );
floorMesh.receiveShadow = true;
floorMesh.castShadow = false;
floorMesh.visible = true;

export const staticWorldColliders: Prefab = {
    localClientComponents: [
      { type: TransformComponent, data: { position: [ 0, -1, 0 ]  } },
      { type: ColliderComponent, data: { type: 'box', scale: scale, mass: 0 }}
    ],
    onAfterCreate: [
        // add a 3d object
         {
             behavior: addObject3DComponent,
             args: {
                 obj3d: floorMesh
             }
         },
    ]
};

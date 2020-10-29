import {
  Group,
  IcosahedronBufferGeometry,
  LOD,
  Mesh,
  MeshPhongMaterial,
} from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";

const lodObject = new LOD();
for (let i = 0; i < 4; i++) {
  const boxGeometry = new IcosahedronBufferGeometry(1, 3 - i);
  const boxMaterial = new MeshPhongMaterial({color: "red"});
  const boxMeshA = new Mesh(boxGeometry, boxMaterial);
  boxMeshA.position.set(-3, 2, -3);
  const boxMeshB = new Mesh(boxGeometry, boxMaterial);
  boxMeshB.position.set(-3, 0, -3);
  const boxMeshGroup = new Group();
  boxMeshGroup.add(boxMeshA);
  boxMeshGroup.add(boxMeshB);

  lodObject.addLevel(boxMeshGroup, i * 4);
}

export const testLODedMesh: Prefab = {
  components: [
    {type: TransformComponent, data: {position: [-3, 8, -3]}},
    {type: ColliderComponent, data: {type: "box", scale: [2, 4, 2], mass: 10}},
    {type: RigidBody}
  ],
  onAfterCreate: [
    // add a 3d object
    {
      behavior: addObject3DComponent,
      args: {
        obj3d: lodObject
      }
    }
  ]
};

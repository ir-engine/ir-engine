import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { BoxBufferGeometry, Color, Mesh, MeshPhongMaterial } from "three";

const boxGeometry = new BoxBufferGeometry(0.3, 0.3, 0.3);
const boxMaterial = new MeshPhongMaterial({ color: new Color(0.813410553336143494, 0.81341053336143494, 0.80206481294706464) });
const boxMesh = new Mesh(boxGeometry, boxMaterial);
boxMesh.name = 'simpleBox';

export const rigidBodyBox3: Prefab = {
    localClientComponents: [
      { type: TransformComponent, data: { position: [0.7, 2,-0.7]} },
      { type: ColliderComponent, data: { type: 'box', scale: [0.3, 0.3, 0.3], mass: 10 }},
      { type: RigidBody }
    ],
    onAfterCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh,
                receiveShadow: true,
                castShadow: true
            }
        }
    ]
};

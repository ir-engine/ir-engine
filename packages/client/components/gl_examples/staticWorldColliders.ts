import { BoxBufferGeometry, Mesh } from "three";
import { myCustomBehavior } from "./mycustomBehavior";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/defaults/behaviors/Object3DBehaviors";
import { ScaleComponent } from "@xr3ngine/engine/src/transform/components/ScaleComponent";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";

const floor = new BoxBufferGeometry(1,0.1,1);

export const staticWorldColliders: Prefab = {
    components: [


    ],
    onCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: Mesh,
                obj3dArgs: floor
            }
        },
        {
            behavior: myCustomBehavior
        }
    ]
};

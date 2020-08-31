import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";
import { BoxBufferGeometry, Mesh } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { myCustomBehavior } from "./mycustomBehavior";


const box = new BoxBufferGeometry(3, 3, 3);

export const rigidBodyBox: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [0,10,0]} }
    ],
    onCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: Mesh,
                obj3dArgs: box
            }
        },
        {
            behavior: myCustomBehavior
        },
        /*
        {
            behavior: attachCamera
        }
        */
    ]
};

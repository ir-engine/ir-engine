import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { addJoystickToScene } from "../../devices/behavior/addJoystickToScene";


export const JoystickPrefab: Prefab = {
    components: [{ type: TransformComponent, data: { position: [-3, 15, 0] } }],
    onCreate: [
        {
            behavior: addComponentFromSchema,
            args: {
                component: AssetLoader,
                componentArgs: {
                    url: "/models/Wildcat_Arena.glb",
                    receiveShadow: true,
                    castShadow: true,
                    onLoaded: addJoystickToScene
                }
            }
        }
    ]
};
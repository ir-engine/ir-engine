import { TransformComponent } from "../../../transform/components/TransformComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { Prefab } from "../../../common/interfaces/Prefab";
import { addWorldColliders } from "../behaviors/addWorldColliders";

export const WorldPrefab: Prefab = {
    components: [{ type: TransformComponent, data: { position: [0, 0.01, 0] } }],
    onCreate: [
        {
            behavior: addComponentFromSchema,
            args: {
                component: AssetLoader,
                componentArgs: {
                    url: "models/worlds/Showroom.glb",
                    receiveShadow: true,
                    castShadow: true,
                    onLoaded: addWorldColliders
                }
            }
        }
    ]
};

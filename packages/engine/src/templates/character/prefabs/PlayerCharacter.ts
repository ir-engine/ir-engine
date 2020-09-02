import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
// import { addPlayerCollider } from "@xr3ngine/engine/src/physics/behaviors/addPlayerCollider";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { Subscription } from "@xr3ngine/engine/src/subscription/components/Subscription";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { CharacterInputSchema } from "@xr3ngine/engine/src/templates/character/CharacterInputSchema";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { CharacterSubscriptionSchema } from "@xr3ngine/engine/src/templates/character/CharacterSubscriptionSchema";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { setCameraPosition } from "../../../camera/behaviors/setCameraPosition";
import { initializeCharacter } from "../behaviors/initializeCharacter";
import { CharacterComponent } from "../components/CharacterComponent";

// Prefab is a pattern for creating an entity and component collection as a prototype
export const PlayerCharacter: Prefab = {
    // These will be created for all players on the network
    // These are only created for the local player who owns this prefab
    components: [
        // ActorComponent has values like movement speed, decelleration, jump height, etc
        // { type: CharacterComponent },
        // Transform system applies values from transform component to three.js object (position, rotation, etc)
        { type: TransformComponent },
        // Local player input mapped to behaviors in the input map
        { type: Input, data: { schema: CharacterInputSchema } },
        // Current state (isJumping, isidle, etc)
        { type: State, data: { schema: CharacterStateSchema } },
        // Similar to Unity's Update(), LateUpdate(), and Start()
        { type: Subscription, data: { schema: CharacterSubscriptionSchema } }
    ],
    onCreate: [
        {
            behavior: addComponentFromSchema,
            args: {
                // addObject3DComponent is going to call new obj(objArgs)
                // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
                component: AssetLoader,
                componentArgs: {
                    url: "models/ToonFemale.glb",
                    receiveShadow: true,
                    castShadow: true
                }
            }
        },
        {
            behavior: initializeCharacter
        },
        // {
        //     behavior: setCameraPosition
        // }
        // TODO: Boxman setup here

        // {
        //     behavior: addPlayerCollider,
        // }

    ],
    onDestroy: [

    ]
};

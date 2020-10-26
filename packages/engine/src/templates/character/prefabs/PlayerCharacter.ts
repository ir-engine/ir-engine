import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { Subscription } from "@xr3ngine/engine/src/subscription/components/Subscription";
import { CharacterInputSchema } from "@xr3ngine/engine/src/templates/character/CharacterInputSchema";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { CharacterSubscriptionSchema } from "@xr3ngine/engine/src/templates/character/CharacterSubscriptionSchema";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { AssetLoader } from "../../../assets/components/AssetLoader";
//import { setCameraFollow } from "../../../camera/behaviors/setCameraFollow";
import { initializeCharacter } from "../behaviors/initializeCharacter";
import { CharacterComponent } from "../components/CharacterComponent";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { Interaction } from "../../../interaction/components/Interacts";
import { CharacterAvatarComponent } from "../components/CharacterAvatarComponent";

// Prefab is a pattern for creating an entity and component collection as a prototype
export const PlayerCharacter: Prefab = {
    // These will be created for all players on the network
    // These are only created for the local player who owns this prefab
    components: [
        // ActorComponent has values like movement speed, deceleration, jump height, etc
        { type: CharacterComponent },
        // Transform system applies values from transform component to three.js object (position, rotation, etc)
        { type: TransformComponent },
        // Local player input mapped to behaviors in the input map
        { type: Input, data: { schema: CharacterInputSchema } },
        { type: CharacterAvatarComponent, data: { avatarId: 'Rose' }},
        { type: LocalInputReceiver },
        // Follow Camera for thet entity
        { type: FollowCameraComponent, data: { distance: 3, mode: "thirdPerson" }},
        // Current state (isJumping, isidle, etc)
        { type: State, data: { schema: CharacterStateSchema } },
        // Similar to Unity's Update(), LateUpdate(), and Start()
        { type: Subscription, data: { schema: CharacterSubscriptionSchema } },
      //  { type: LocalInputReceiver }
        { type: Interaction }
    ],
    onAfterCreate: [
        // {
        //     behavior: addComponentFromSchema,
        //     args: {
        //         // addObject3DComponent is going to call new obj(objArgs)
        //         // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
        //         component: AssetLoader,
        //         componentArgs: {
        //             url: "models/avatars/Rose.glb",
        //             receiveShadow: true,
        //             castShadow: true
        //         }
        //     }
        // },
        {
            behavior: initializeCharacter
        }
    ],
    onBeforeDestroy: [

    ]
};

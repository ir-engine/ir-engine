import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { DefaultInputSchema } from "@xr3ngine/engine/src/input/defaults/DefaultInputSchema";
import { addPlayerCollider, removePlayerCollider } from "@xr3ngine/engine/src/physics/behaviors/addPlayerCollider";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { DefaultStateSchema } from "@xr3ngine/engine/src/state/defaults/DefaultStateSchema";
import { Subscription } from "@xr3ngine/engine/src/subscription/components/Subscription";
import { DefaultSubscriptionSchema } from "@xr3ngine/engine/src/subscription/defaults/DefaultSubscriptionSchema";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { BoxBufferGeometry, Mesh } from "three";
import { addObject3DComponent, removeObject3DComponent } from "@xr3ngine/engine/src/common/defaults/behaviors/Object3DBehaviors";
import { Actor } from "@xr3ngine/engine/src/common/defaults/components/Actor";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";

const miniGeo = new BoxBufferGeometry(0.2, 0.2, 0.2);

// Prefab is a pattern for creating an entity and component collection as a prototype
export const PlayerController: Prefab = {
    // These will be created for all players on the network
    // These are only created for the local player who owns this prefab
    components: [
        // Actor has values like movement speed, decelleration, jump height, etc
        { type: Actor },
        // Transform system applies values from transform component to three.js object (position, rotation, etc)
        { type: TransformComponent },
        // Local player input mapped to behaviors in the input map
        { type: Input, data: { schema: DefaultInputSchema } },
        // Current state (isJumping, isidle, etc)
        { type: State, data: { schema: DefaultStateSchema } },
        // Similar to Unity's Update(), LateUpdate(), and Start()
        { type: Subscription, data: { schema: DefaultSubscriptionSchema } }
    ],
    onCreate: [
        {
            behavior: addObject3DComponent,
            args: {
                // addObject3DComponent is going to call new obj(objArgs)
                // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
                obj3d: Mesh,
                obj3dArgs: miniGeo
            }
        },

        {
          behavior: attachCamera
        },
        
        {
            behavior: addPlayerCollider
        }
    ],
    onDestroy: [
        {
            behavior: removeObject3DComponent
        },
        {
            behavior: removePlayerCollider
        }
    ]
};

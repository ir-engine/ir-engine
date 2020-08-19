import { Prefab } from "./interfaces";
import { Actor, addObject3DComponent, removeObject3DComponent } from ".";
import { TransformComponent, Input, DefaultInputSchema, State, DefaultStateSchema, Subscription, DefaultSubscriptionSchema, addMeshCollider, attachCamera } from "..";
import { Mesh, BoxBufferGeometry, MeshStandardMaterial } from "three";

const miniGeo = new BoxBufferGeometry(0.2, 0.2, 0.2)

// Prefab is a pattern for creating an entity and component collection as a prototype
const PlayerCharacter: Prefab = {
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
            behavior: addMeshCollider,
        }
    ],
    onDestroy: [
        {
            behavior: removeObject3DComponent
        }
        // TODO:
        // {
        //     behavior: removeMeshCollider,
        // }
    ]
};
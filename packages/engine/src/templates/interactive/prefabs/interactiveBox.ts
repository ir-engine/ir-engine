import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { Interactive } from "../../../interaction/components/Interactive";
import { onInteraction, onInteractionHover } from "../functions/interactiveBox";

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = new MeshPhongMaterial({ color: 'blue' });
const boxMesh = new Mesh(boxGeometry, boxMaterial);

export const interactiveBox: Prefab = {
    components: [
        { type: TransformComponent, data: { position: [-3, 2,-3] } },
        {
            type: Interactive,
            data: {
                interactiveDistance: 3,
                onInteractionFocused: onInteractionHover,
                onInteraction: onInteraction
            }
        }
    ],
    onCreate: [
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh,
            }
        },
        {
            behavior: addMeshCollider,
            args: {
               type: 'box', scale: [1, 1, 1], mass: 10
            }
        },
        {
            behavior: addMeshRigidBody
        }
    ]
};

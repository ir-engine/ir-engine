import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/scene/behaviors/addObject3DComponent";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { Interactable } from "../../../interaction/components/Interactable";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Object3DComponent } from "@xr3ngine/engine/src/scene/components/Object3DComponent";
import { getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";

const onInteraction: Behavior = (entity, args, delta, entityOut, time) => {
  const event = new CustomEvent('object-activation', { detail: { url: "https://google.com" } });
  document.dispatchEvent(event);
};

const onInteractionHover: Behavior = (entity, { focused }: { focused: boolean }, delta, entityOut, time) => {
  const event = new CustomEvent('object-hover', { detail: { focused, label: "Use to open google.com" } });
  document.dispatchEvent(event);

  if (!hasComponent(entityOut, Object3DComponent)) {
    return;
  }

  const object3d = getMutableComponent(entityOut, Object3DComponent).value as Mesh;
  if (Array.isArray(object3d.material)) {
    object3d.material.forEach( m => {
      m.opacity = focused? 0.5 : 1;
      m.transparent = focused;
    });
  } else {
    object3d.material.opacity = focused? 0.5 : 1;
    object3d.material.transparent = focused;
  }
};

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = [
  new MeshPhongMaterial({ color: 'blue' }),
  new MeshPhongMaterial({ color: 'yellow' }),
  new MeshPhongMaterial({ color: 'green' }),
  new MeshPhongMaterial({ color: 'red' }),
  new MeshPhongMaterial({ color: 'cyan' }),
  new MeshPhongMaterial({ color: 'magenta' })
];
const boxMesh = new Mesh(boxGeometry, boxMaterial);

export const googleBox: Prefab = {
    localClientComponents: [
        { type: TransformComponent, data: { position: [3, 1, 3] } },
        {
            type: Interactable,
            data: {
                interactiveDistance: 3,
                onInteractionFocused: onInteractionHover,
                onInteraction: onInteraction
            }
        }
    ],
    onAfterCreate: [
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh,
            }
        },
        {
            behavior: addMeshCollider,
            args: {
               type: 'box', scale: [1, 1, 1], mass: 4
            }
        },
        {
            behavior: addMeshRigidBody
        }
    ]
};

import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { ColliderComponent } from "@xr3ngine/engine/src/physics/components/ColliderComponent";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";
import { Interactive } from "../../../interaction/components/Interactive";
import { onInteraction, onInteractionHover } from "../../interactive/functions/commonInteractive";

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = new MeshPhongMaterial({ color: 'red' });
const boxMesh = new Mesh(boxGeometry, boxMaterial);
boxMesh.name = 'simpleBox';

export const rigidBodyBox: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [-3, 1,-3]} },
      { type: ColliderComponent, data: { type: 'box', scale: [1, 1, 1], mass: 10 }},

      { type: Interactive, data: {
          onInteraction: onInteraction,
          onInteractionFocused: onInteractionHover,
          data: {
            action: 'infoBox',
            payload: {
              name: 'Razer Blade Stealth 13 - 4K Touch 60Hz - GeForce GTX 1650 Ti Max-Q - Black',
              url: 'https://www.razer.com/gaming-laptops/Razer-Blade-Stealth-13/RZ09-03102E52-R3U1',
              buyUrl: 'https://www.razer.com/product-added/RZ09-03102E52-R3U1',
              learnMoreUrl: 'https://www.razer.com/gaming-laptops/razer-blade',
              modelUrl: 'models/devices/razer_laptop.glb',
              htmlContent: `<h5>Razer Blade Stealth 13 - 4K Touch 60Hz - GeForce GTX 1650 Ti Max-Q - Black</h5>
  The World’s First Gaming Ultrabook™<br />
  US$1,999.99<br />
  <strong>Specifications</strong>
  10th Gen Intel® Core™ i7-1065G7 Quad-Core Processor<br />
  Windows 10 Home<br />
  13.3" 4K Touch 60Hz w/ 4.9 mm slim side bezel<br />
  NVIDIA® GeForce GTX 1650 Ti Max-Q (4GB GDDR5 VRAM)<br />
  512GB<br />
  16GB dual-channel (fixed)<br />
  Single-zone RGB powered by Razer Chroma™`
            },
            interactionText: 'View product info'
          }
        }
      }
    ],
    onAfterCreate: [
        // add a 3d object
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh
            }
        }
    ]
};

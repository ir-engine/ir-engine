import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { Interactable } from "../../../interaction/components/Interactable";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { Entity } from "../../../ecs/classes/Entity";
import { onInteraction, onInteractionHover } from "../../interactive/functions/commonInteractive";

export const RazerLaptop: Prefab = {
  components: [
    { type: TransformComponent, data: { position: [3,3,3]} },
    { type: RigidBody },
    { type: Interactable, data: {
        onInteraction: onInteraction,
        onInteractionFocused: onInteractionHover,
        data: {
          action: 'infoBox',
          payload: {
            name: 'Razer Blade Stealth 13 - 4K Touch 60Hz - GeForce GTX 1650 Ti Max-Q - Black',
            url: 'https://www.razer.com/gaming-laptops/Razer-Blade-Stealth-13/RZ09-03102E52-R3U1',
            buyUrl: 'https://www.razer.com/product-added/RZ09-03102E52-R3U1',
            learnMoreUrl: 'https://www.razer.com/gaming-laptops/razer-blade',
            modelUrl: '/models/devices/razer_laptop.glb',
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
      behavior: addComponentFromSchema,
      args: {
        component: AssetLoader,
        componentArgs: {
          url: "/models/devices/razer_laptop.glb",
          receiveShadow: true,
          castShadow: true,
          onLoaded: (entityIn: Entity, args: unknown, delta: number, entityOut: Entity): void => {

          }
        }
      }
    },
    {
      behavior: addMeshCollider,
      args: {
        type: 'box',
        scale: [0.434122, 0.367724, 0.55483],
        mass: 1
      }
    },
  ]
};

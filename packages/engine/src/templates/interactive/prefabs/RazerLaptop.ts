/*
razer_laptop.glb

================================

And this URL
https://www.razer.com/gaming-laptops/Razer-Blade-Stealth-13/RZ09-03102E52-R3U1

================================

Blurb:
Razer Blade Stealth 13 - 4K Touch 60Hz - GeForce GTX 1650 Ti Max-Q - Black
The World’s First Gaming Ultrabook™
US$1,999.99
Specifications
10th Gen Intel® Core™ i7-1065G7 Quad-Core Processor
Windows 10 Home
13.3" 4K Touch 60Hz w/ 4.9 mm slim side bezel
NVIDIA® GeForce GTX 1650 Ti Max-Q (4GB GDDR5 VRAM)
512GB
16GB dual-channel (fixed)
Single-zone RGB powered by Razer Chroma™

================================

Learn more button goes here: https://www.razer.com/gaming-laptops/razer-blade



**********
Bonus points if you can get this to work w/ mobile AR on a new page. https://modelviewer.dev/examples/webxr.html

 */

import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { Interactive } from "../../../interaction/components/Interactive";
import { getInCar } from "../../car/behaviors/getInCarBehavior";
import { getInCarPossible } from "../../car/behaviors/getInCarPossible";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { Entity } from "../../../ecs/classes/Entity";
import { createTrimesh } from "../../../physics/behaviors";
import { onInteraction, onInteractionHover } from "../functions/commonInteractive";

export const RazerLaptop: Prefab = {
  components: [
    { type: TransformComponent, data: { position: [3,0.5,3]} },
    // { type: SoundEffect, data: { src: 'audio/honk.mp3', volume: 0.6 } },
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
            modelUrl: 'assets/models/razer_laptop.glb'
          }
        }
      }
    }
  ],
  onCreate: [
    // add a 3d object
    {
      behavior: addComponentFromSchema,
      args: {
        component: AssetLoader,
        componentArgs: {
          url: "models/razer_laptop.glb",
          receiveShadow: true,
          castShadow: true,
          onLoaded: (entityIn:Entity, args:unknown, delta:number, entityOut:Entity): void => {

            // createTrimesh(vehicleCollider, offset, mass)

          }
        }
      }
    },
    {
      behavior: addMeshCollider,
      args: {
        type: 'sphere', scale: [1, 1, 1], mass: 1
      }
    },
  ]
};


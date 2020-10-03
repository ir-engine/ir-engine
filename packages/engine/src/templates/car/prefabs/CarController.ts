import { Color } from "three";

import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";

import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { Input } from "@xr3ngine/engine/src/input/components/Input";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { attachCamera } from "@xr3ngine/engine/src/camera/behaviors/attachCamera";
import { addCarPhysics } from "@xr3ngine/engine/src/physics/behaviors/addCarPhysics";
import { CharacterStateSchema } from "@xr3ngine/engine/src/templates/character/CharacterStateSchema";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { addComponentFromSchema } from "../../../common/behaviors/addComponentFromSchema";
 import { VehicleInputSchema } from "@xr3ngine/engine/src/templates/car/VehicleInputSchema";
import { Interactive } from "../../../interaction/components/Interactive";
import { getInCar } from "../behaviors/getInCarBehavior";
import { getInCarPossible } from "../behaviors/getInCarPossible";
import { Entity } from "../../../ecs/classes/Entity";
import { changeColor } from "../behaviors/changeColor";
import { onInteractionHover } from "../../interactive/functions/commonInteractive";

export const CarController: Prefab = {
    components: [
      { type: TransformComponent, data: { position: [-3,6,3]} },
      // Local player input mapped to behaviors in the input map
       { type: Input, data: { schema: VehicleInputSchema } },
      // { type: SoundEffect, data: { src: 'audio/honk.mp3', volume: 0.6 } },
      // Current state (isJumping, isidle, etc)
    //   { type: State, data: { schema: VehicleStateSchema } },
      // Similar to Unity's Update(), LateUpdate(), and Start()
  //    { type: Subscription, data: { schema: DefaultSubscriptionSchema } }
        { type: Interactive, data: {
            onInteraction: getInCar,
            onInteractionCheck: getInCarPossible,
            onInteractionFocused: onInteractionHover,
            data:{
              interactionText: 'get in car'              
            },
          }
        }
    ],
    onCreate: [
        // add a 3d object
        {
            behavior: addComponentFromSchema,
            args: {
                // addObject3DComponent is going to call new obj(objArgs)
                // so this will be new Mesh(new BoxBufferGeometry(0.2, 0.2, 0.2))
                component: AssetLoader,
                componentArgs: {
                    url: "models/vehicles/Sportscar.glb", //  "models/car.glb"
                    receiveShadow: true,
                    castShadow: true,
                    onLoaded: (entityIn:Entity, args:unknown, delta:number, entityOut:Entity): void => {
                      addCarPhysics(entityIn, args, delta, entityOut);
                      changeColor(entityIn, {
                        materialName: "Main",
                        color: new Color(1,1,1)
                      });
                    }
                }
            }
        },
        // {
        //     behavior: addCarPhysics
        // },
/*
        {
            behavior: attachCamera
        }
*/
    ]
};

import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactable } from "../components/Interactable";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interactor } from "../components/Interactor";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { isClient } from "../../common/functions/isClient";
import { Quaternion, Vector3 } from "three";
import { Engine } from "@xr3ngine/engine/src/ecs/classes/Engine";
import { TransformComponent } from '../../transform/components/TransformComponent';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";

const startedPosition = new Map<Entity,NumericalType>();
/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */
export const interact: Behavior = (entity: Entity, args: any, delta): void => {
  //console.warn('Behavior: interact , networkId ='+getComponent(entity, NetworkObject).networkId);
  if (isClient) return;

    /*
    if(getComponent(entity, NetworkObject).ownerId !== Network.instance.userId) {
      console.warn('fixed');
      return;
    }
    */


    let focusedArrays = [];
    for (let i = 0; i < Engine.entities.length; i++) {
      const isEntityInteractable = Engine.entities[i];
      if (hasComponent(isEntityInteractable, Interactable)) {
        let interactive = getComponent(isEntityInteractable, Interactable);
        let intPosition = getComponent(isEntityInteractable, TransformComponent).position;
        let position = getComponent(entity, TransformComponent).position;

        if (interactive.interactionPartsPosition.length > 0) {
          interactive.interactionPartsPosition.forEach((v,i) => {
            if (position.distanceTo(new Vector3(...v).add(intPosition)) < 3) {
              focusedArrays.push([isEntityInteractable, position.distanceTo(new Vector3(...v).add(intPosition)), i])
            }
          })
        } else {
          if (position.distanceTo(intPosition) < 3) {
            focusedArrays.push([isEntityInteractable, position.distanceTo(intPosition), null])
          }
        }
      }
    }

    focusedArrays = focusedArrays.sort((a: any, b: any) => a[1] - b[1]);
    if (focusedArrays.length < 1) return;

    let interactable = getComponent(focusedArrays[0][0], Interactable);

  //  console.warn('found networkId: '+getComponent(focusedArrays[0][0], NetworkObject).networkId+' seat: '+focusedArrays[0][2]);

    if (interactable.onInteractionCheck(entity, focusedArrays[0][0], focusedArrays[0][2])) {
    //  console.warn('start with networkId: '+getComponent(focusedArrays[0][0], NetworkObject).networkId+' seat: '+focusedArrays[0][2]);
      interactable.onInteraction(entity, { currentFocusedPart: focusedArrays[0][2] }, delta, focusedArrays[0][0]);
    }


    /*
    if (!hasComponent(entity, Interactor)) {
        console.error(
          'Attempted to call interact behavior, but actor does not have Interactor component'
        );
        return;
      }

      const { focusedInteractive: focusedEntity } = getComponent(entity, Interactor);
      const mouseScreenPosition = getComponent(entity, Input).data.get(DefaultInput.SCREENXY);

      if (args.phaze === LifecycleValue.STARTED ){
        startedPosition.set(entity, mouseScreenPosition.value);
        return;
      }
      if (!focusedEntity) {
        // no available interactive object is focused right now
        return;
      }

      // const startedMousePosition = startedPosition.get(entity);
      // if (
      //   startedMousePosition[0] !== mouseScreenPosition.value[0] ||
      //   startedMousePosition[1] !== mouseScreenPosition.value[1]
      // ) {
      //   // mouse moved, skip "click"
      //   console.warn('mouse moved!');
      //   return;
      // }

      if (!hasComponent(focusedEntity, Interactable)) {
        console.error(
          'Attempted to call interact behavior, but target does not have Interactive component'
        );
        return;
      }

      const interactive = getComponent(focusedEntity, Interactable);
      if (interactive && typeof interactive.onInteraction === 'function') {
        interactive.onInteraction(entity, args, delta, focusedEntity);
      } else {
        console.warn('onInteraction is not a function');
      }
      */

};

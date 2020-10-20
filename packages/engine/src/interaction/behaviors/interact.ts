import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { Interactive } from "../components/Interactive";
import { getComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Interacts } from "../components/Interacts";
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Engine } from "../../ecs/classes/Engine";
import { TouchInputs } from "../../input/enums/TouchInputs";
import { Vector2 } from "three";
import { normalizeMouseCoordinates } from "../../common/functions/normalizeMouseCoordinates";

/**
 *
 * @param entity the one who interacts
 * @param args
 * @param delta
 */


const startedPosition = new Map<Entity,any>();
const touchPosition = new Map<Entity,any>();

export const  interact: Behavior = (entity: Entity, args: any, delta): void => {
  if (!hasComponent(entity, Interacts)) {
    console.error(
      'Attempted to call interact behavior, but actor does not have Interacts component'
    )
    return
  }
  
  const { focusedInteractive: focusedEntity } = getComponent(entity, Interacts)
  const input = getComponent(entity, Input)
  
  // console.log(args)

  const mouseScreenPosition = getComponent(entity, Input).data.get(DefaultInput.SCREENXY)
  const touchScreenPosition = getComponent(entity, Input).data.get(DefaultInput.SCREENXY)

  const normalTouch = normalizeMouseCoordinates(touchScreenPosition.value[0], touchScreenPosition.value[1], window.innerWidth, window.innerHeight);
  // if (touchScreenPosition){
  // touchScreenPosition[0] = ( touchScreenPosition[0] / window.innerWidth ) * 2 - 1;
  // touchScreenPosition[1] = - ( touchScreenPosition[1] / window.innerHeight ) * 2 + 1;
  // }
  // const touchScreen = new Vector2();
  // if (touchScreenPosition) {
  //   touchScreen.x = touchScreenPosition.value[0];
	//   touchScreen.y = touchScreenPosition.value[1];
  //   }
  //   const touchScreenArray = [];
  //   touchScreenArray.push(touchScreen);
  
  if (args.phaze === LifecycleValue.STARTED ){
    startedPosition.set(entity,mouseScreenPosition.value);
    return
  }

  console.log(normalTouch);
  
  
  if (args.touchPhaze === LifecycleValue.STARTED ){
    touchPosition.set(entity,normalTouch);
    return
  }

  // console.log(touchPosition);

  const startedMousePosition = startedPosition.get(entity);
  const startedTouchPosition = touchPosition.get(entity);
  
  // console.log('Mouse position on START',startedMousePosition)
  // console.log('Current mouse position', mouseScreenPosition.value)

  console.log('Touch position on START',startedTouchPosition);
  console.log('Current touch position', normalTouch);
 
  if (startedMousePosition !== mouseScreenPosition.value || startedTouchPosition !== touchScreenPosition) {
    if (!focusedEntity) {
      // no available interactive object is focused right now
      return
    }
  }

    if (!hasComponent(focusedEntity, Interactive)) {
      console.error(
        'Attempted to call interact behavior, but target does not have Interactive component'
      )
      return
    }

    const interactive = getComponent(focusedEntity, Interactive)
    if (interactive && typeof interactive.onInteraction === 'function') {
      interactive.onInteraction(entity, args, delta, focusedEntity)
    }
  
};

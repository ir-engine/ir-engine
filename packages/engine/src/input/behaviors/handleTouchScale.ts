// import { Behavior } from '../../common/interfaces/Behavior';
// import { Entity } from '../../ecs/classes/Entity';
// import { InputType } from '../enums/InputType';
// import { Input } from '../components/Input';
// import { getComponent } from '../../ecs/functions/EntityFunctions';
// import { LifecycleValue } from '../../common/enums/LifecycleValue';
// import { TouchInputs } from '../enums/TouchInputs';
// import { DefaultInput } from '../../templates/shared/DefaultInput';
// import { Vector2 } from 'three';

// /**
//  * System behavior called whenever the mouse pressed
//  *
//  * @param {Entity} entity The entity
//  * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
//  */

// export const handleTouchScale: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
//   if (args.event.targetTouches.length < 2) {
//     return;
//   }

//   const input = getComponent(entity, Input);

//   const lastTouchPosition1Array = input.prevData.get(DefaultInput.POINTER1_POSITION)?.value;
//   const lastTouchPosition2Array = input.prevData.get(DefaultInput.POINTER2_POSITION)?.value;
//   if (args.event.type === 'touchstart' || !lastTouchPosition1Array || !lastTouchPosition2Array) {
//     // skip if it's just start of gesture or there are no previous data yet
//     return;
//   }

//   if (!input.data.has(DefaultInput.POINTER1_POSITION) || !input.data.has(DefaultInput.POINTER2_POSITION)) {
//     console.warn('handleTouchScale requires POINTER1_POSITION and POINTER2_POSITION to be set and updated.');
//     return;
//   }

//   const currentTouchPosition1 = new Vector2().fromArray(input.data.get(DefaultInput.POINTER1_POSITION).value as number[]);
//   const currentTouchPosition2 = new Vector2().fromArray(input.data.get(DefaultInput.POINTER2_POSITION).value as number[]);

//   const lastTouchPosition1 = new Vector2().fromArray(lastTouchPosition1Array as number[]);
//   const lastTouchPosition2 = new Vector2().fromArray(lastTouchPosition2Array as number[]);

//   const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];

//   // console.log(lastTouchPosition1);
//   // console.log(lastTouchPosition2);
//   // console.log(currentTouchPosition1);
//   // console.log(currentTouchPosition2);

//   const currentDistance = currentTouchPosition1.distanceTo(currentTouchPosition2);
//   const lastDistance = lastTouchPosition1.distanceTo(lastTouchPosition2);

//   const touchScaleValue = lastDistance - currentDistance ;

//   console.log(currentDistance);
//   console.log(lastDistance);
//   console.log(touchScaleValue);
//   // console.log(currentTouchPosition2);

//   // If mouse position not set, set it with lifecycle started
//   // input.data.set(scaleMappedInputKey, {
//   //   type: InputType.TWODIM,
//   //   value: touchScaleValue * 100, // TODO: remove 100 multiplication after mouse scroll will be normalized (or divided by 100)
//   //   lifecycleState: input.data.has(scaleMappedInputKey)? LifecycleValue.CHANGED : LifecycleValue.STARTED
//   // });
//   input.data.set(scaleMappedInputKey, {
//     type: InputType.TWODIM,
//     value: touchScaleValue * 100, // TODO: remove 100 multiplication after mouse scroll will be normalized (or divided by 100)
//     lifecycleState:LifecycleValue.CHANGED
//   });
// };